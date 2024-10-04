import { GameObj, KaboomCtx } from "kaboom";
import { scale } from "./constants";

//player object
export function makePlayer(k: KaboomCtx, posX: number, posY: number){
    const player = k.make([
        k.sprite("assets", {anim: "kirbIdle"}),
        k.area({shape: new k.Rect(k.vec2(4, 5.9), 8, 10)}),
        k.body(),
        k.pos(posX * scale, posY * scale),
        k.scale(scale),
        k.doubleJump(10),
        k.health(3),
        k.opacity(1),
        {
            speed: 300,
            direction: "right",
            isInhaling: false,
            isFull: false,
        },
        "player",
    ]);

//player on collision with enemy
    player.onCollide("enemy", async (enemy : GameObj) => {
        if(player.isInhaling && enemy.isInhalable){
            player.isInhaling = false;
            k.destroy(enemy);
            player.isFull = true;
            return;
        }

//if player has 0 hp
        if(player.hp() === 0){
            k.destroy(player);
            k.go("level-1");
            return;
        }

//player gets hit, if collision occurs and player is not 0 hp
        player.hurt();
//player blinking effect
        await k.tween(
            player.opacity,
            0,
            0.05,
            (val) => (player.opacity = val),
            k.easings.linear
        );
        await k.tween(
            player.opacity,
            1,
            0.05,
            (val) => (player.opacity = val),
            k.easings.linear
        );
    });

    player.onCollide("exit", () => {
        k.go("level-2");
    });

    //breathing effect
    const inhaleEffect = k.add([
        k.sprite("assets", {anim: "kirbInhaleEffect"}),
        k.pos(),
        k.scale(scale),
        k.opacity(0),
        "inhaleEffect",
    ]);

    const inhaleZone = player.add([
        k.area({shape: new k.Rect(k.vec2(0), 20, 4)}),
        k.pos(),
        "inhaleZone",
    ])

    inhaleZone.onUpdate(() => {
        if(player.direction === "left"){
            inhaleZone.pos = k.vec2(-14, 8);
            inhaleEffect.pos = k.vec2(player.pos.x - 60, player.pos.y + 0);
            inhaleEffect.flipX = true;
            return;
        }
        inhaleZone.pos = k.vec2(14,8);
        inhaleEffect.pos = k.vec2(player.pos.x + 60, player.pos.y + 0);
        inhaleEffect.flipX = false;
    });

    //if the player falls
    player.onUpdate(() => {
        if(player.pos.y > 2000){
            //resets the state and everything by going back
            k.go("level-1");
        }
    });

    return player;
}
