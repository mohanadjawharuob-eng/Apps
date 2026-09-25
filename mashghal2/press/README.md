# press/

Screenshots of the running app, used by the landing page at
`/Apps/mashghal2.html`. Nothing in the app loads them.

They are **generated, never hand-edited**. The capture script drives the real
app at a fixed viewport, loads the example, waits for the "Example loaded" message to
clear — a message about something that happened has no business in a product
shot — and captures each screen as JPEG at quality 84.

| file | what it shows |
|---|---|
| `home-dark.jpg` | Home: the alarms, then the four cards |
| `references-dark.jpg` | Library → References, with the export controls |
| `skill-dark.jpg` | one skill's page — evidence, and no score |
| `projects-light.jpg` | Work → Projects in the light theme |
| `library-light.jpg` | Library → Scripts in the light theme |
| `ask-dark.jpg` | the command bar answering a question |
| `phone-home.jpg` | Home at 390px |
| `phone-actions.jpg` | Actions at 390px |

If a screen changes, re-run the capture rather than cropping an old picture.
The script itself lives in the session scratchpad with the rest of the driving
scripts, the way every test in this repository does — nothing in `Apps/` runs
it and nothing ships it.
