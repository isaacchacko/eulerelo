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
      - [x] round starts in: 3 2 1
        - should contain player names, elos, problems solved (just whatever we can display from the db), executive decision: problems solved != necessary
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
    - [ ] elo calculate/update function
    - [ ] forfeit function
    - [ ] time tracking by socket server: how long questions are solved
    - [ ] advance round number, update round wins/losses

# envisioned commits/branches

- [x] "write this branch doc" commit
- [ ] backend branch **(in progress: isaac)**
- [ ] frontend branch
- [ ] notification screens branch
