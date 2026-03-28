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
I set up a "ground" so the jump has something to land on and physics acts on the hero.