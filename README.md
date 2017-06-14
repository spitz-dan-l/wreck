# wreck


Now, here is the list of commands that can currently be entered:

- **rotate** *direction*
  
  *direction* can be **left** or **right**.
  
  This is rotating about the y axis, meaning the top stays at the top. It rotates 90 degrees to the left or right.
  
- **roll** *direction*

  *direction* can be **forward**, **backward**, **left** or **right**.
  
  This is rotating about either the x or z axis. Whichever direction you specify, that is the direction the top of the box will be pointing afterwards.
  
- **lift**
  
  This lifts the box. It will tell you how much the box weighs, and the box might break open and spill out when you lift it.
  
- **cut** on *face* *direction* along *cut-start-1* from *cut-start-2* to *cut-end-2*

  This cuts the box in a straight line.
  
  The *face* must be either **top** or **front**, since those are the faces accessible to the player. (To cut other faces you'd want to use **rotate** or **roll** first.)
  
  The *direction* is either **horizontally** or **vertically**.
  
  The *cut-X-Y* bits depend on whether you said **horizontally** or **vertically**. They specify the start and end points of the cut relative to the face you're cutting on.
  They can be **top**, **middle**, **bottom**, or **left**, **center** **right**.
  
  An example:
  
  **cut_box** on **top** **horizontally** along **middle** from **left** to **right**.
    
- **tape** on *face* *direction* along *tape-start-1* from *tape-start-2* to *tape-end-2*
  
  Works the same as **cut** (see above).
  
- **open** *face*
  
  *face* can be **top**, **front**, **back**, **left**, **right**. (Bottom isn't allowed because the bottom face is on the floor. You'll have to **roll_box** to get at it.)
  
  Causes any dangling pieces of cardboard on *face* to be swung open.
  
- **close** *face*
  
  Same as **open_dangle**, except the piece of cardboard is swung closed (see above).

- **remove** *face*

  Same as **open**, except it will remove a completely-free piece of cardboard (called a "rend"), rather than a dangling piece.

- **replace** *face*

  Same as **remove**, except the free piece of cardboard will be put back in place over the hole.

- **take item**
  
  Takes an item from the box. This only works if the box is already open.
