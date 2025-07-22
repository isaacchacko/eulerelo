# goals

- [ ] complete the backend for the `phase0` branch

- [ ] prisma
  - [ ] base problem + base solution structure
  - [ ] new problem table on db to store base prob/soln
  - [ ] new table to store past game info
    - nothing major, just the competitor names, who won, number of problems solved per player, elo gained, elo lost
- [ ] socket server
  - [ ] refactor to span multiple files
  - [ ] functions
    - [ ] problem/solution evaluation function (requires: problem table)
    - [ ] time tracking. how long questions are solved
    - [ ] elo calculate/update function
    - [ ] advance round number, update round wins/losses
    - [ ] forfeit function
    - [ ] round complete function

# envisioned commits

- [x] create this document
- [x] design new table schema for the "MatchHistory", "Problems" and push migration to docker db
- [ ] refactor socket server
- [ ] design problem + solution structure and redesign evaluation function accordingly. pull out the evaluation away from the client side and onto server side.
- [ ] round tracking function.
- [ ] elo calculation
- [ ] round complete function
- [ ] time tracking
- [ ] forfeit function
