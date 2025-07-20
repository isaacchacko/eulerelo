**to allen/anyone who reads this, im not done working on this `phase0.md` document. please complete the list of commits that we aspire to hit when completing phase 0, and order then based on pre-reqs.**

# goals

## general

- [ ] complete the mvp
- [ ] have a complete game loop (if the user doesn't _need_ the feature to play then ignore it)

## accessibility/profile

- [x] make profile page public
- [x] add a duel button in the navbar

## practice room

- [ ] propagate changes from duel to matchmaking

## duel

- opponent display
  - [x] make the opponent's profile link work
  - [ ] show the opponents elo
- player logistics
  - [x] specify if the person sending a message is a competitor or spectator
  - [x] announce player join/exit
- gameplay
  - frontend
    - notification screens
      - [ ] round starts in: 3 2 1
        - should contain player names, elos, problems solved (just whatever we can display from the db)
      - [ ] problem solved! next problem:
        - who solved the problem, how long did they take, any wrong solutions they tried before
        - next problem countdown (change "next" to "final" on problem 5/5)
      - [ ] match results screen
        - who won, who lost, elo gained/lost, average time taken
        - play again, to leaderboard, to home button
    - general
      - [ ] mobile layout versus desktop layout
      - [ ] round count, who won who lost (ex: Round 1/5)
      - [ ] add a forfeit button
  - backend
    - [ ] base problem + base solution structure
    - [ ] new problem table on db to store base prob/soln
    - [ ] new table to store past game info
      - nothing major, just the competitor names, who won, number of problems solved per player, elo gained, elo lost
    - [ ] elo update function
    - [ ] forfeit function
    - [ ] time tracking by socket server: how long questions are solved

# envisioned commits (unordered)

- [ ] write this branch doc
- [ ] make new tables (game info, problems) and make basic single problem entry (complex problems can be added by willy)
- [ ] make elo update function
- [ ] make forfeit function
- [ ] add time tracking by socket server
- [ ] complete mobile/desktop layout and create all fake buttons.
- [ ] make all notification screen layouts (for now just test on some random endpoint)
