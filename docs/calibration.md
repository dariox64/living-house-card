# Calibration mode – fit the card to your own house

Every house picture is different, so labels and room outlines must match **your** picture. You don't have to guess coordinates – the card has a built-in editor.

1. Add the card with your `image` and a list of `rooms` (names + entities, no positions yet).
2. Open the dashboard as an **admin** and click the **calibration** button (square with nodes) in the top-right corner.
3. **Move labels:** drag a room label to its place. Drag the **yellow corner** to resize it.
4. **Select a room** in the panel and:
   - **Draw outline** – click the corners of the room on the picture (walls and floor edges), then **Finish**. This outline is what goes dark when the lights are off and what glows in the LED colour.
   - **Zoom point** – click the spot the camera should fly to when the room is opened.
   - **TV screen** – (rooms with `tv:`) click the four corners of the TV screen.
   - **Undo point** removes the last click.
5. Press **Copy YAML**. Edit the dashboard → ⋮ → **Raw configuration editor** and replace the `rooms:` section of the card with the copied text. Save.

> If copying is blocked (HTTP without HTTPS), the YAML appears in a text box – select it and press Ctrl+C.

Tips

- Outlines don't need to be perfect – the edges are softened.
- Outline the floor area *and* the visible walls of the room, it looks more natural.
- Drag the calibration panel by its title if it covers a room.
