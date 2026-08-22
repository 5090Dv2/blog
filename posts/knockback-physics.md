---
title: Minecraft 1.8.8 ClubSpigot 击退物理系统深度解析
date: 2026-08-21
author: 5090Dv2
category: Minecraft
tags: Minecraft,Java,Spigot,Knockback
excerpt: 深入分析ClubSpigot中击退物理系统的实现原理，从Entity速度字段到网络同步的完整链路。
---

# Minecraft 1.8.8 ClubSpigot 击退物理系统深度解析

## 一、Entity.java — 核心速度字段与物理基础

### 1.1 速度字段定义 (Entity.java:62-64)

```java
public double motX;  // X轴速度向量（左右）
public double motY;  // Y轴速度向量（上下）
public double motZ;  // Z轴速度向量（前后）
```

这三个字段是整个物理系统的基石。所有运动——行走、跳跃、击退、爆炸——最终都通过修改这三个值来实现。

### 1.2 速度累加方法 g() (Entity.java:1127-1132)

```java
public void g(double d0, double d1, double d2) {
    this.motX += d0;
    this.motY += d1;
    this.motZ += d2;
    this.ai = true;  // 标记实体已移动（需要同步）
}
```

这是一个叠加型速度修改方法，与直接赋值不同。爆炸效果（Explosion.java:144）就通过 `entity.g(d8 * d14, d9 * d14, d10 * d14)` 将爆炸方向向量叠加到现有速度上。

### 1.3 速度限制安全阀 (Entity.java:1317-1328)

```java
if (!(getBukkitEntity() instanceof Vehicle)) {
    if (Math.abs(this.motX) > 10.0D) {
        this.motX = 0.0D;  // 速度异常大时直接归零
    }
    if (Math.abs(this.motY) > 10.0D) {
        this.motY = 0.0D;
    }
    if (Math.abs(this.motZ) > 10.0D) {
        this.motZ = 0.0D;
    }
}
```

从 NBT 反序列化时，如果速度超过 10.0（约 200 方块/秒），直接归零。这防止了异常数据导致的"飞天"。

### 1.4 velocityChanged 标记与 ac() 方法 (Entity.java:74, 1134-1136)

```java
public boolean velocityChanged;  // 是否需要向客户端同步速度

protected void ac() {
    this.velocityChanged = true;  // 基类：无条件标记
}
```

`velocityChanged` 是一个脏标记（dirty flag）。当服务器修改了实体速度后，标记为 `true`，表示下一个 tick 需要通过网络包告知客户端。

### 1.5 移动与碰撞检测 move() (Entity.java:455-695)

这是整个引擎中最核心的方法之一，处理：

- **仙人掌/蛛网减速** (Entity.java:482-489)：当 `this.H = true` 时，移动速度被大幅削减
- **潜行边缘防跌落** (Entity.java:495-538)：如果玩家在潜行状态且在地面，逐步减小移动量直到能安全停止
- **分轴碰撞检测** (Entity.java:540-565)：Y轴、X轴、Z轴分别进行碰撞检测
- **边缘滑动** (Entity.java:566-659)：使用 `stepHeight`（默认0.6）处理台阶
- **速度归零** (Entity.java:685-691)：碰撞发生时对应轴速度归零
- **方块摩擦力效果** (Entity.java:693-695)：着地时触发方块的物理效果

## 二、EntityLiving.java — 击退核心计算

### 2.1 damageEntity 完整实现 (EntityLiving.java:768-879)

```java
public boolean damageEntity(DamageSource damagesource, float f) {
    // 1. 无敌类型检查
    if (this.isInvulnerable(damagesource)) return false;
    
    // 2. 服务端确认（客户端不会执行伤害逻辑）
    if (this.world.isClientSide) return false;
    
    // 3. 超远距离保护
    this.ticksFarFromPlayer = 0;
    if (this.getHealth() <= 0.0F) return false;
    
    // 4. 火焰抗性检查（抗火药水）
    if (damagesource.o() && this.hasEffect(MobEffectList.FIRE_RESISTANCE)) return false;
    
    // 5. 受击音效准备
    this.aB = 1.5F;
    boolean flag = true;
    
    // 6. 无敌时间 (noDamageTicks) 检查
    if ((float) this.noDamageTicks > (float) this.maxNoDamageTicks / 2.0F) {
        return false;
    } else {
        // 7. 实际伤害计算（调用 d() 方法，含护甲/附魔减伤）
        if (!this.d(damagesource, f)) {
            return false;
        }
        this.lastDamage = f;
        this.noDamageTicks = this.maxNoDamageTicks;  // 重置无敌帧
        this.hurtTicks = this.av = 10;  // 受击动画持续时间
    }
    
    // 8. AI仇恨响应
    Entity entity = damagesource.getEntity();
    if (entity != null) {
        if (entity instanceof EntityLiving) {
            this.b((EntityLiving) entity);  // 设置 lastDamager
        }
        if (entity instanceof EntityHuman) {
            this.lastDamageByPlayerTime = 100;
            this.killer = (EntityHuman) entity;
        }
    }
    
    // 9. 核心击退计算入口
    if (flag && !(knockbackCancelled = paperSpigotConfig.disableExplosionKnockback 
            && damagesource.isExplosion() && this instanceof EntityHuman)) {
        
        this.world.broadcastEntityEffect(this, (byte) 2);  // 红色受伤闪烁
        
        if (damagesource != DamageSource.DROWN) {
            this.ac();  // 标记需要速度同步
        }
        
        if (entity != null) {
            double d0 = entity.locX - this.locX;
            double d1;
            for (d1 = entity.locZ - this.locZ; 
                 d0 * d0 + d1 * d1 < 1.0E-4D; 
                 d1 = (Math.random() - Math.random()) * 0.01D) {
                d0 = (Math.random() - Math.random()) * 0.01D;
            }
            this.aw = (float) (MathHelper.b(d1, d0) * 180.0D / 3.1415927410125732D 
                               - (double) this.yaw);
            this.a(entity, f, d0, d1);  // 调用击退计算方法
        }
    }
}
```

### 2.2 击退计算核心方法 a() (EntityLiving.java:944-966)

这是 ClubSpigot 修改过的击退算法，与原版有显著差异：

```java
public void a(Entity entity, float f, double d0, double d1) {
    // 第一道门槛：击退抗性（Knockback Resistance）
    if (this.random.nextDouble() >= this.getAttributeInstance(GenericAttributes.c).getValue()) {
        this.ai = true;
        
        float f1 = MathHelper.sqrt(d0 * d0 + d1 * d1);  // 水平距离
        float f2 = 0.4f;  // 水平击退强度
        float f3 = 0.4f;  // 垂直击退强度
        
        // ClubSpigot 自定义击退倍率
        double knockbackReductionHorizontal = 1.0 - ClubSpigot.INSTANCE.getConfig().getKnockbackHorizontal();
        double knockbackReductionVertical = 1.0 - ClubSpigot.INSTANCE.getConfig().getKnockbackVertical();
        
        double frictionHorizontal = 2.0 - knockbackReductionHorizontal;
        double frictionVertical = 2.0 - knockbackReductionVertical - 0.25;
        
        f2 = (float)((double)f2 * (1.0 - knockbackReductionHorizontal));
        f3 = (float)((double)f3 * (1.0 - knockbackReductionVertical));
        
        // 先用摩擦力"压缩"现有速度
        this.motX /= frictionHorizontal;
        this.motY /= frictionVertical;
        this.motZ /= frictionHorizontal;
        
        // 叠加新的击退速度
        this.motX -= d0 / (double)f1 * (double)f2;
        this.motY += (double)f3;
        this.motZ -= d1 / (double)f1 * (double)f2;
        
        // 垂直速度上限
        if (this.motY > (double)0.4f) {
            this.motY = 0.4f;
        }
    }
}
```

### 数学原理详解

假设配置 `knockbackHorizontal = 1.0`（默认值），`knockbackVertical = 1.0`：

```
knockbackReductionHorizontal = 1.0 - 1.0 = 0.0
knockbackReductionVertical = 1.0 - 1.0 = 0.0
frictionHorizontal = 2.0 - 0.0 = 2.0
frictionVertical = 2.0 - 0.0 - 0.25 = 1.75

f2 = 0.4 * (1.0 - 0.0) = 0.4
f3 = 0.4 * (1.0 - 0.0) = 0.4

// 现有速度先除以2（水平）/ 1.75（垂直）
motX /= 2.0;   // 现有速度减半
motY /= 1.75;  // 现有垂直速度压缩
motZ /= 2.0;

// 叠加击退
motX -= (dx / dist) * 0.4;   // 水平击退 = 0.4
motY += 0.4;                  // 垂直击退 = 0.4（上限0.4）
motZ -= (dz / dist) * 0.4;
```

当 `knockbackHorizontal = 1.5` 时（增大击退）：

```
knockbackReductionHorizontal = 1.0 - 1.5 = -0.5
frictionHorizontal = 2.0 - (-0.5) = 2.5
f2 = 0.4 * (1.0 - (-0.5)) = 0.4 * 1.5 = 0.6  // 击退增强50%
```

### 2.3 ac() 方法的覆写 — 击退抗性概率门 (EntityLiving.java:1855-1857)

```java
protected void ac() {
    this.velocityChanged = this.random.nextDouble() >= this.getAttributeInstance(GenericAttributes.c).getValue();
}
```

`GenericAttributes.c` = `generic.knockbackResistance`，默认值为 `0.0`（对大部分生物），铁傀儡为 `0.7`。

- 当值为 `0.0` 时：`random >= 0.0` 永远为 `true`，总是同步速度
- 当值为 `0.7` 时：只有 30% 的概率同步速度（相当于 70% 概率免疫击退的视觉反馈）

> 注意：这个概率检查只影响速度同步，不影响实际速度计算。实际击退在 `a()` 方法中通过另一个 `random >= knockbackResistance` 检查来决定是否执行。

### 2.4 无敌时间系统

```java
// Entity.java:96
public int noDamageTicks;  // 当前剩余无敌帧

// EntityLiving.java:254-255（在 tick 中递减）
if (this.noDamageTicks > 0 && !(this instanceof EntityPlayer)) {
    --this.noDamageTicks;
}
```

对于玩家（EntityPlayer），在 `t_()` 中手动处理：

```java
// EntityPlayer.java:196-198
if (this.noDamageTicks > 0) {
    --this.noDamageTicks;
}
```

设置时机（EntityLiving.java:798）：

```java
this.noDamageTicks = this.maxNoDamageTicks;
```

默认 `maxNoDamageTicks = 20`（1秒），ClubSpigot 可通过 `settings.yml` 的 `default-no-damage-ticks` 配置。

## 三、EntityHuman.java — 玩家攻击方法

### 3.1 attack() 完整实现 (EntityHuman.java:970-1063)

```java
public void attack(Entity entity) {
    if (entity.aD() && !entity.l(this)) {
        // 1. 基础伤害计算
        float f = (float)this.getAttributeInstance(GenericAttributes.ATTACK_DAMAGE).getValue();
        
        // 2. 附魔伤害加成
        float f1 = entity instanceof EntityLiving ? 
            EnchantmentManager.a(this.bA(), ((EntityLiving)entity).getMonsterType()) : 
            EnchantmentManager.a(this.bA(), EnumMonsterType.UNDEFINED);
        
        // 3. 击退附魔等级
        int i = EnchantmentManager.a(this);
        if (this.isSprinting()) {
            ++i;  // 冲刺时击退+1级
        }
        
        // 4. 暴击检测
        boolean flag = !paperSpigotConfig.disablePlayerCrits && this.fallDistance > 0.0f 
            && !this.onGround && !this.k_() && !this.V() 
            && !this.hasEffect(MobEffectList.BLINDNESS) && this.vehicle == null 
            && entity instanceof EntityLiving;
        if (flag && f > 0.0f) {
            f *= 1.5f;  // 暴击1.5倍伤害
        }
        
        f += f1;
        
        // 5. 保存攻击前速度
        double d0 = entity.motX;
        double d1 = entity.motY;
        double d2 = entity.motZ;
        
        // 6. 执行伤害（触发击退）
        boolean flag2 = entity.damageEntity(DamageSource.playerAttack(this), f);
        
        if (flag2) {
            // 7. 冲刺额外击退（叠加在 damageEntity 的击退之上）
            if (this.isApplyingSprintKnockback()) {
                entity.g(
                    -MathHelper.sin(this.yaw * (float)Math.PI / 180.0f) * (float)i * 0.5f,
                    0.1,
                    MathHelper.cos(this.yaw * (float)Math.PI / 180.0f) * (float)i * 0.5f
                );
                this.setApplyingSprintKnockback(false);
            }
            
            // 8. 玩家速度同步
            if (entity instanceof EntityPlayer && entity.velocityChanged) {
                Player player = (Player)((Object)entity.getBukkitEntity());
                Vector velocity = new Vector(d0, d1, d2);
                PlayerVelocityEvent event = new PlayerVelocityEvent(player, velocity.clone());
                this.world.getServer().getPluginManager().callEvent(event);
                
                if (!event.isCancelled()) {
                    if (!velocity.equals(event.getVelocity())) {
                        player.setVelocity(event.getVelocity());
                    }
                    ((EntityPlayer)entity).playerConnection.sendPacket(
                        new PacketPlayOutEntityVelocity(entity));
                    entity.velocityChanged = false;
                    entity.motX = d0;
                    entity.motY = d1;
                    entity.motZ = d2;
                }
            }
            
            // 9. 暴击粒子
            if (flag) {
                this.b(entity);
            }
            // 10. 击退附魔粒子
            if (f1 > 0.0f) {
                this.c(entity);
            }
        }
    }
}
```

### 冲刺击退的额外机制 (EntityLiving.java:1287-1302)

```java
public void setSprinting(boolean flag) {
    super.setSprinting(flag);
    this.setApplyingSprintKnockback(flag);
    
    AttributeInstance attributeinstance = this.getAttributeInstance(GenericAttributes.MOVEMENT_SPEED);
    if (attributeinstance.a(EntityLiving.a) != null) {
        attributeinstance.c(EntityLiving.b);
    }
    if (flag) {
        attributeinstance.b(EntityLiving.b);
    }
}
```

当玩家从冲刺状态发起攻击时，`attack()` 中通过 `entity.g()` 额外叠加一个向量：

- 水平方向：`-sin(yaw) * knockbackLevel * 0.5` 和 `cos(yaw) * knockbackLevel * 0.5`
- 垂直方向：固定 `0.1`（轻微上扬）

这意味着冲刺 + 击退附魔会产生叠加的击退效果。

## 四、网络速度同步机制

### 4.1 PacketPlayOutEntityVelocity

```java
public PacketPlayOutEntityVelocity(Entity var1) {
    this(var1.getId(), var1.motX, var1.motY, var1.motZ);
}

public PacketPlayOutEntityVelocity(int var1, double var2, double var4, double var6) {
    this.a = var1;  // 实体ID
    
    double var8 = 3.9D;  // 速度上限 = 3.9 方块/tick ≈ 78 方块/秒
    if (var2 < -var8) var2 = -var8;
    if (var4 < -var8) var4 = -var8;
    if (var6 < -var8) var6 = -var8;
    if (var2 > var8) var2 = var8;
    if (var4 > var8) var4 = var8;
    if (var6 > var8) var6 = var8;
    
    // 精度转换：double -> short（乘以8000）
    this.b = (int) (var2 * 8000.0D);
    this.c = (int) (var4 * 8000.0D);
    this.d = (int) (var6 * 8000.0D);
}
```

关键参数：

- **速度上限**：3.9 方块/tick，约 78 方块/秒。超过此值的速度会被钳位
- **精度**：`1/8000 = 0.000125` 方块。对于正常游戏速度来说精度足够
- **网络开销**：每个速度包 10 字节（1 int + 3 short）

### 4.2 服务端发送时机

速度包在以下情况发送：

1. **实体自然移动**：每个 tick 检查 `velocityChanged` 标记
2. **伤害击退**：`damageEntity()` 中调用 `ac()` 触发
3. **爆炸推力**：`Explosion.java` 中叠加速度后触发
4. **玩家攻击**：`attack()` 中立即发送给被攻击者

### 4.3 客户端预测与回滚

客户端收到速度包后：

1. 立即应用新速度到本地实体
2. 重置本地物理预测状态
3. 后续移动由服务器权威结果覆盖

这就是为什么在网络延迟较高时，击退效果会出现"拉回"现象——客户端预测了移动，但服务器的权威结果否定了它。