# Variant Screening Developer Log

# Comments
I added various comments since the majority of the codebase is basically foreign to me.
Comments are there for me to understand that makes specific things happen.

# Changes
I made the player character smaller as a start for what I want to do with the actual gameplay loop.
    In doing so, I also adjusted the margin.

# Additions
I added the ability to make the player character jump with a mouse click.
    First reason I did this was to see what I could do just by copying code and simple google searches.
    Also did this since space key auto scrolls the browser page, => inconvenient for gameplay.

I added a physics system to the config so I can set up a hitbox system.
As of this commit, the jump actually changes the hitbox height, but does not play the animation.
    Now obsolete, animation plays.
I set up a "ground" so the jump has something to land on and physics acts on the hero.
It also can repeatedly jump without hitting the ground, which needs to be fixed.

I have created "bullets" that come from either side of the screen and can hit the player.
    If the player successfully dodges a bullet, the score goes up.
    If the player gets hit by a bullet, the score goes down.

# Challenges
I came across a bug where the "bullets" didn't render, but were spawned.
    I realized they were rendering behind everything else.
    I then logged it and saw they appeared to be falling off the screen.
    I had to manually create the physics object inside the group to prevent gravity acting.

There is currently a disparity between the jump animation and the actual jump timing.