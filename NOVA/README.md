# NOVA — Julia-Motoko Bridge

**Networked Omniscient Verified Architecture**

A complete translation layer between Julia scientific computing and Motoko smart contracts on the Internet Computer.

## Why This Isn't Just a Library

A library only gives functions. NOVA gives:

- ✅ **Functions** — Core computation in Julia
- ✅ **Type Map** — Complete isomorphism layer
- ✅ **Generated Wrappers** — Motoko actor + TypeScript client
- ✅ **Candid Interface** — Type-safe ICP integration
- ✅ **AI-Readable Manifest** — For automated tooling
- ✅ **Examples** — Usage documentation
- ✅ **Tests** — Roundtrip verification
- ✅ **Bridge Runtime** — JavaScript orchestration
- ✅ **Computational Proof Records** — Verifiable computation

## The Analogy

Think of NOVA as a **customs office between countries**:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Julia Country │    │  JavaScript     │    │  Motoko Country │
│                 │    │     Bridge      │    │                 │
│ Matrix{Float64} │◄──►│ Type Conversion │◄──►│ [[Float]]       │
│ eigen, FFT      │    │ WASM, Registry  │    │ Actor calls     │
│ optimization    │    │ Async coord     │    │ Candid          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

The bridge checks the **passport** (type isomorphism) of every value crossing the border.

## Quick Start

### From JavaScript
```javascript
import { getJuliaCompute } from './protocols/PROTOCOL-JULIA.js'
const julia = getJuliaCompute()
await julia.initialize()
const result = await julia.eigen([[4, 2], [2, 3]])
```

### From Motoko
```motoko
import JuliaCompute "JuliaCompute"
let result = await JuliaCompute.linalg_eigen(matrix)
```

### From CLI
```bash
nova-julia call linalg.eigen --matrix '[[4,2],[2,3]]'
```

### From AI Agent
Read `/llms.txt` and `/ai/bridge_manifest.json`, then use function cards to generate calls.

## Directory Structure

```
NOVA/
├── protocols/
│   └── PROTOCOL-JULIA.js      # JavaScript SDK
├── julia/
│   └── NovaJulia.jl           # Julia module
├── generated/
│   ├── JuliaCompute.mo        # Motoko canister
│   ├── julia_compute.did      # Candid interface
│   └── julia_compute_client.ts # TypeScript client
├── ai/
│   ├── bridge_manifest.json   # AI-readable spec
│   ├── type_map.json          # Type isomorphisms
│   ├── function_cards/        # Per-function docs
│   │   ├── linalg_eigen.json
│   │   ├── stats_mean.json
│   │   └── phi_gradient_descent.json
│   └── examples/
│       └── call_eigen.md
├── cli/
│   └── nova-julia             # CLI tool
├── tests/
│   ├── roundtrip.test.js
│   ├── type_map.test.js
│   └── wrapper_generation.test.js
└── llms.txt                   # AI instructions
```

## Available Functions

### Linear Algebra
| Function | Description | Complexity |
|----------|-------------|------------|
| `linalg.eigen` | Eigenvalue decomposition | O(n³) |
| `linalg.svd` | Singular value decomposition | O(mn²) |
| `linalg.qr` | QR factorization | O(mn²) |
| `linalg.lu` | LU factorization | O(n³) |
| `linalg.cholesky` | Cholesky factorization | O(n³/3) |

### Signal Processing
| Function | Description | Complexity |
|----------|-------------|------------|
| `signal.fft` | Fast Fourier Transform | O(n log n) |
| `signal.ifft` | Inverse FFT | O(n log n) |

### Statistics
| Function | Description | Complexity |
|----------|-------------|------------|
| `stats.mean` | Arithmetic mean | O(n) |
| `stats.std` | Standard deviation | O(n) |
| `stats.cov` | Covariance matrix | O(n²m) |
| `stats.cor` | Correlation matrix | O(n²m) |

### Phi-Enhanced (φ)
| Function | Description | Complexity |
|----------|-------------|------------|
| `phi.gradient_descent` | Golden ratio adaptive optimization | O(n × iter) |
| `phi.resonance_filter` | Phi-harmonic extraction | O(n log n) |

## Type Isomorphisms

The bridge handles automatic type conversion:

| Julia | JavaScript | Motoko | Candid |
|-------|------------|--------|--------|
| `Float64` | `number` | `Float` | `float64` |
| `Int64` | `bigint` | `Int` | `int64` |
| `Bool` | `boolean` | `Bool` | `bool` |
| `String` | `string` | `Text` | `text` |
| `Vector{Float64}` | `Float64Array` | `[Float]` | `vec float64` |
| `Matrix{Float64}` | `number[][]` | `[[Float]]` | `vec vec float64` |

**Note**: Julia uses column-major matrices; JavaScript/Motoko use row-major. The bridge transposes automatically.

## Phi Constants

```javascript
PHI = 1.618033988749895      // Golden ratio
PHI_INV = 0.618033988749895  // 1/φ = φ-1
HEARTBEAT = 873              // Synchronization period
GOLDEN_ANGLE = 137.508       // 360°/φ²
```

## Computational Proofs

Enable proof recording for verifiable computation:

```javascript
const julia = getJuliaCompute({ enableProofRecording: true })
await julia.initialize()
await julia.eigen(matrix)

const proof = julia.getAllProofRecords()[0]
// {
//   id: "julia_1621234567890_abc123",
//   function: "linalg.eigen",
//   inputHash: "sha256:...",
//   outputHash: "sha256:...",
//   computeTimeMs: 12.34,
//   phiEnhanced: false
// }
```

## Multiple Entry Points

The bridge serves different users through different doors:

| User | Entry Point | Method |
|------|-------------|--------|
| Human Developer | `protocols/PROTOCOL-JULIA.js` | Import SDK |
| Smart Contract Dev | `generated/JuliaCompute.mo` | Import actor |
| Build System | `cli/nova-julia` | Shell commands |
| AI Agent | `ai/bridge_manifest.json` | Read specs |
| Research Reviewer | `ai/examples/` | Documentation |

## Running Tests

```bash
# From NOVA directory
node --test tests/*.test.js
```

## License

Part of the NOVA system. See repository root for license.

---

*Powered by φ = 1.618033988749895*
