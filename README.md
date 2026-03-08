# Math Game Collection

> 수학적 최적화 문제를 게임으로 즐겨보세요!

**Play now:** https://0820hong.github.io/math-games/

## Games

### 1. Seesaw Balance (시소 밸런스)
양쪽 숫자의 합을 같게 맞춰 타일을 제거하는 퍼즐 게임

- **수학 개념:** Partition Problem (분할 문제)
- **난이도:** Easy (5x5) / Normal (7x7) / Hard (10x10)
- **특징:** 콤보 시스템, 등급 평가, BGM, SNS 공유

### 2. Delivery Master (배달의 신)
모든 배달 지점을 최단거리로 방문하는 경로 최적화 게임

- **수학 개념:** Travelling Salesman Problem (TSP)
- **난이도:** Easy (5곳) / Normal (7곳) / Hard (10곳)
- **특징:** 최적 경로 대비 점수, 경로 시각화

## Tech Stack

- Vanilla HTML / CSS / JavaScript
- Web Audio API (procedural BGM)
- Canvas API (result image generation)
- GitHub Pages (static hosting)

## Project Structure

```
math-games/
├── index.html              # Game portal
├── privacy.html            # Privacy policy
├── favicon.svg
├── og-portal.png
├── og-seesaw.png
├── seesaw-game/
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── game.js         # Core game logic
│       ├── board.js         # Tile grid rendering
│       ├── seesaw.js        # Seesaw animation
│       ├── timer.js         # Countdown timer
│       ├── bgm.js           # Procedural BGM
│       ├── share.js         # SNS sharing
│       ├── ad.js            # Ad management
│       └── main.js          # Event binding
└── tsp-game/
    ├── index.html
    ├── css/style.css
    └── js/
        ├── game.js          # Game state
        ├── canvas.js        # Route visualization
        ├── tsp-solver.js    # Optimal route solver
        ├── share.js         # Result sharing
        └── main.js          # Event binding
```

## License

MIT
