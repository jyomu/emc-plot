# EMC Plot - Touchstone S-Parameter Plotter

EMC Plot is a web-based tool for plotting and analyzing Touchstone S-parameter files, commonly used in electromagnetic compatibility (EMC) and RF engineering. This application supports n-port S-parameter analysis with both frequency and time domain visualization.

## Features

- **Touchstone File Support**: Load and visualize S-parameter data from Touchstone (.s1p, .s2p, .snp) files
- **Multi-Port Analysis**: Support for n-port S-parameter networks
- **Frequency Domain Plotting**: Standard S-parameter magnitude and phase plots
- **Time Domain Analysis**: Discrete Fourier Transform (DFT) and Inverse DFT (IDFT) capabilities
- **Data Preprocessing**: 
  - Moving average filtering
  - Logarithmic scaling (log, log10, log2)
  - Half-spectrum display options
- **Interactive Visualization**: Powered by Plotly.js for responsive, interactive charts
- **Parameter Selection**: Choose specific S-parameters to display and analyze

## Usage

1. **Load Data**: Upload a Touchstone S-parameter file using the file input
2. **Select Parameters**: Choose which S-parameters to plot from the available options
3. **Configure Display**: Adjust preprocessing options like moving averages and logarithmic scaling
4. **Analyze**: View frequency domain plots and optional time domain transformations

The application provides three main visualization modes:
- **Raw S-Parameters**: Direct frequency domain plots of the loaded data
- **DFT Processing**: Frequency domain analysis with preprocessing options
- **IDFT Processing**: Time domain representation via inverse Fourier transform

## Development

This project is built with React, TypeScript, and Vite, and deployed on Cloudflare Workers.

### Prerequisites

- Node.js (latest LTS version recommended)
- npm or yarn package manager

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd emc-plot

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run lint` - Run ESLint code analysis
- `npm run preview` - Preview production build locally
- `npm run deploy` - Deploy to Cloudflare Workers
- `npm run cf-typegen` - Generate Cloudflare Worker types

### Deployment

This application is configured for deployment on Cloudflare Workers:

```bash
npm run deploy
```

Make sure you have Wrangler CLI configured with your Cloudflare account credentials.

## Technology Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **Visualization**: Plotly.js with React integration
- **State Management**: TanStack Query (React Query)
- **Deployment**: Cloudflare Workers
- **Development**: ESLint for code quality
