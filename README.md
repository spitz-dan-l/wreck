# wreck


Now, here is the list of pseudo commands that can currently be entered:

- **rotate_y_box** *direction*
  
  *direction* can be **left** or **right**.
  
  This is rotating about the y axis, meaning the top stays at the top. It rotates 90 degrees to the left or right.
  
- **roll_box** *direction*

  *direction* can be **forward**, **backward**, **left** or **right**.
  
  This is rotating about either the x or z axis. Whichever direction you specify, that is the direction the top of the box will be pointing afterwards.
  
- **lift_box**
  
  This lifts the box. It will tell you how much the box weighs, and the box might break open and spill out when you lift it.
  
- **cut_box** *face* *direction* *cut-start-1* *cut-start-2* *cut-end-2*

  This cuts the box in a straight line.
  
  The *face* must be either **top** or **front**, since those are the faces accessible to the player. (To cut other faces you'd want to use **rotate_y_box** or **roll_box**.)
  
  The *direction* is either **horizontally** or **vertically**.
  
  The *cut-X-Y* bits depend on whether you said **horizontally** or **vertically**. They specify the start and end points of the cut relative to the face you're cutting on.
  They can be **top**, **middle**, **bottom**, or **left**, **center** **right**.
  
  The basic meaning of the whole command can be best understood if we add in missing english words:
  
  **cut_box** on the *face* face *direction* along the *cut_start*, from *cut-start-2* to *cut-end-2*.
  
  An example:
  
  The command:
  
  **cut_box top horizontally middle left right**
  
  Basically means:
  
  **cut_box** on the **top** face **horizontally** along the **middle**, from **left** to **right**.
  
  (I'll be working on adding support for the placeholder words. For the *pseudo-commands*, they are left out.)
  
- **tape_box** *face* *direction* *tape-start-1* *tape-start-2* *tape-end-2*
  
  Works the same as **cut_box** (see above).
  
- **open_dangle** *face*
  
  *face* can be **top**, **front**, **back**, **left**, **right**. (Bottom isn't allowed because the bottom face is on the floor. You'll have to **roll_box** to get at it.)
  
  Causes any dangling pieces of cardboard on *face* to be swung open.
  
- **close_dangle** *face*
  
  Same as **open_dangle**, except the piece of cardboard is swung closed (see above).

- **open_rend** *face*

  Same as **open_dangle**, except it will open a completely-free piece of cardboard (called a "rend"), rather than a dangling piece.

- **close_rend** *face*

  Same as **open_rend**, except the free piece of cardboard will be put back in place over the hole.

- **take_item_box**
  
  Takes an item from the box. This only works if the box is already open.
