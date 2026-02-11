# SO-ARM Scratch Programming Interface

A kid-friendly visual programming interface for the SO-ARM101 robot arm using block-based programming similar to Scratch. Inspired by [Bambot](https://bambot.org).

## 🎯 What is SO-ARM Scratch?

SO-ARM Scratch is an educational tool that teaches programming through visual, block-based programming. No typing needed—just drag, drop, and create! Perfect for beginners learning robotics and programming concepts.

### For Students & Educators
- **Learn by doing**: No complex syntax—just drag blocks and watch your robot move
- **Safe experiments**: Try ideas in simulation before running on real hardware
- **Visual feedback**: See exactly what your code does in real-time
- **Save & share**: Create programs, save them, and share with classmates

### For Developers
See [Contributing](#contributing) for development setup, testing, and architecture details.

## ✨ Features

- 🤖 **3D Robot Visualization**: See your robot in a 3D environment
- 🧩 **Block-Based Programming**: Drag and drop blocks to program your robot
- 🔗 **Direct Robot Connection**: Connect to your physical SO-ARM101 via USB/Serial
- 👶 **Kid-Friendly Interface**: Designed specifically for children to learn programming
- 💾 **Save/Load Programs**: Export and import your programs as JSON files
- ⚡ **Real-time Control**: See your program execute on both the virtual and physical robot

![SO-ARM Scratch Programming Interface](./public/preview.png)

## 🚀 Getting Started

### For Users (Students & Educators)

#### Prerequisites
- A modern web browser (Chrome, Edge, Firefox, or Safari)
- SO-ARM101 robot arm (optional—you can practice with the 3D simulator)
- USB cable to connect the robot (for hardware use)

#### Step-by-Step Guide

1. **Open the application**
   - Go to [SO-ARM Scratch website](https://so-arm-scratch.vercel.app)
   - No installation needed!

2. **Connect Your Robot (Optional)**
   - Click the "Connect Robot" button in the top-right corner
   - Select your SO-ARM101 device from the list
   - The status indicator will turn green when connected
   - If no robot is available, use the 3D simulator

3. **Program Your Robot**
   Available blocks:
   - **Move Joint**: Control individual joints of the robot arm
   - **Rotate Base**: Rotate the robot's base
   - **Wait**: Add delays between movements
   - **Repeat**: Loop actions multiple times
   - Combine these blocks to create complex movements!

4. **Build Your Program**
   1. Click on blocks in the left palette to add them to your program
   2. Drag blocks to reorder them
   3. Click on a block to edit its parameters in the right panel
   4. Use the X button to remove blocks

5. **Run Your Program**
   - Click "Run Program" to execute your blocks
   - Watch the 3D simulation (and physical robot if connected) move together
   - Use "STOP" for emergency stops
   - Adjust and try again!

6. **Save and Share**
   - Export your programs as JSON files
   - Import previously saved programs
   - Share your creations with friends and teachers!

---

### For Developers

#### Prerequisites
- **Node.js** 18+ or **Bun** (faster JavaScript runtime)
- **Git** for version control

#### Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd so-arm-scratch
```

2. **Install dependencies**:
```bash
bun install
# or: npm install
```

3. **Start the development server**:
```bash
bun run dev
```

4. **Open your browser** and navigate to `http://localhost:3000`

#### Available Commands

| Command | Purpose |
|---------|---------|
| `bun run dev` | Start development server with hot reload |
| `bun run build` | Create production build |
| `bun run preview` | Preview production build locally |
| **Code Quality** | |
| `bun run lint` | Check code with Biome linter |
| `bun run lint:fix` | Auto-fix linting issues |
| `bun run format` | Check code formatting |
| `bun run format:write` | Auto-format all code |
| `bun run check` | Run lint + format in one command |
| **Testing** | |
| `bun run test` | Run all tests with Vitest |
| `bun run test:ui` | Run tests with interactive UI |
| `bun run test:coverage` | Generate test coverage report |

## 🛠 Technology Stack

### Frontend
- **React 19**: Modern UI framework
- **Vite**: Lightning-fast build tool
- **Three.js & React Three Fiber**: 3D robot visualization
- **Tailwind CSS**: Responsive styling
- **Radix UI**: Accessible UI components
- **shadcn/ui**: Pre-built component library

### Code Quality
- **Biome**: Fast formatter + linter (replaces ESLint & Prettier)
- **TypeScript**: Type-safe code
- **Husky + Lint-staged**: Pre-commit hooks for code quality

### Testing
- **Vitest**: Blazing-fast test runner
- **React Testing Library**: Test components like users do
- **jsdom**: Browser environment for tests

### Robotics
- **feetech.js**: Communication with SO-ARM101
- **URDF Loader**: Robot arm model visualization

### Deployment
- **Vercel**: Automatic deployments from git

## 📁 Project Structure

```
so-arm-scratch/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Block.tsx        # Block UI component
│   │   ├── WorkspaceSheet.tsx  # Workspace panel
│   │   ├── ErrorBoundary.tsx   # Error handling
│   │   └── ...              # Other components
│   ├── context/             # React Context (state management)
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Core logic & utilities
│   │   ├── blockExecutor.ts # Block execution engine
│   │   ├── blockShapes.ts   # Block visual definitions
│   │   ├── theme/           # Color & styling
│   │   └── types.ts         # TypeScript types
│   ├── data/                # Static data (block definitions)
│   ├── test/                # Test setup
│   ├── App.tsx              # Root component
│   └── main.tsx             # Entry point
├── public/                  # Static assets
├── .github/
│   └── workflows/ci.yml     # Automated quality checks
├── biome.json               # Code quality configuration
├── vitest.config.ts         # Test configuration
├── vite.config.ts           # Build configuration
├── tsconfig.json            # TypeScript configuration
├── CONTRIBUTING.md          # Developer guidelines
├── LICENSE                  # MIT License
├── .env.example             # Environment template
└── package.json             # Project metadata & scripts
```

## 🧪 Testing

This project maintains high code quality through automated testing:

- **19+ unit tests** covering the block execution engine
- **Pre-commit hooks** that run linting and formatting
- **GitHub Actions CI** that checks code quality on every push

Run tests locally:
```bash
bun run test          # Run all tests once
bun run test:ui       # Run with interactive UI
bun run test:coverage # See code coverage
```

## 📋 Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Development setup
- Code style guidelines (using Biome)
- Testing requirements
- Pull request process
- Architecture patterns

Quick start for contributors:
```bash
bun install
bun run dev          # Start coding
bun run lint:fix     # Fix linting issues
bun run test         # Verify tests pass
```

## 🚢 Deployment

This project is deployed on [Vercel](https://vercel.com). Every push to the main branch automatically:
1. Runs code quality checks (linting & type checking)
2. Runs all tests
3. Deploys to production if all checks pass

## 📄 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) file for details.

## 🤝 Support

- **Questions?** Check the [How to Use](#-getting-started) section above
- **Found a bug?** Open an issue on GitHub
- **Want to contribute?** See [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Need help?** Ask in discussions or create an issue

## 🎓 Learning Resources

- [Bambot](https://bambot.org) - Inspiration for this project
- [Scratch](https://scratch.mit.edu) - Block-based programming
- [Three.js Documentation](https://threejs.org/docs/) - 3D graphics
- [React Documentation](https://react.dev) - UI framework
