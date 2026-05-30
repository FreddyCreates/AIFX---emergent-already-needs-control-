# How to Call the Eigenvalue Function

This example demonstrates calling `linalg.eigen` through the Julia-Motoko bridge
from different interfaces.

## The Problem

Given a 2×2 matrix:
```
A = | 4  2 |
    | 2  3 |
```

We want to find eigenvalues λ and eigenvectors v such that Av = λv.

## 1. From JavaScript

```javascript
import { getJuliaCompute } from './protocols/PROTOCOL-JULIA.js'

// Initialize the bridge
const julia = getJuliaCompute()
await julia.initialize()

// Define the matrix (row-major order)
const matrix = [
  [4, 2],
  [2, 3]
]

// Compute eigenvalues and eigenvectors
const result = await julia.eigen(matrix)

console.log('Eigenvalues:', result.values)
// Output: [{ real: 5.236, imag: 0 }, { real: 1.764, imag: 0 }]

console.log('Eigenvectors:', result.vectors)
// Each column is an eigenvector

// Verify: A * v ≈ λ * v
const v1 = result.vectors[0].map(c => c.real)
const lambda1 = result.values[0].real
const Av1 = [
  matrix[0][0] * v1[0] + matrix[0][1] * v1[1],
  matrix[1][0] * v1[0] + matrix[1][1] * v1[1]
]
const lambdaV1 = v1.map(x => lambda1 * x)
console.log('A*v1:', Av1)
console.log('λ1*v1:', lambdaV1)
// These should be approximately equal
```

## 2. From Motoko

```motoko
import JuliaCompute "canister:julia_compute"
import Debug "mo:base/Debug"

actor {
    public func computeEigenvalues() : async () {
        // Define the matrix
        let matrix : [[Float]] = [
            [4.0, 2.0],
            [2.0, 3.0]
        ];
        
        // Call the Julia bridge
        let result = await JuliaCompute.linalg_eigen(matrix);
        
        switch (result) {
            case (#ok(eigen)) {
                Debug.print("Eigenvalues:");
                for (val in eigen.values.vals()) {
                    Debug.print("  " # Float.toText(val.real) # " + " # 
                               Float.toText(val.imag) # "i");
                };
            };
            case (#err(msg)) {
                Debug.print("Error: " # msg);
            };
        };
    };
}
```

## 3. From CLI

```bash
# Basic call with inline matrix
nova-julia call linalg.eigen --matrix '[[4,2],[2,3]]'

# With matrix from file
echo '[[4,2],[2,3]]' > matrix.json
nova-julia call linalg.eigen --matrix matrix.json

# Output format options
nova-julia call linalg.eigen --matrix '[[4,2],[2,3]]' --format json
nova-julia call linalg.eigen --matrix '[[4,2],[2,3]]' --format pretty

# With proof recording
nova-julia call linalg.eigen --matrix '[[4,2],[2,3]]' --record-proof
```

## 4. From AI Agent

AI agents can use the bridge through the MCP protocol or by reading the function cards:

### Using MCP Tool

```json
{
  "tool": "julia_compute",
  "arguments": {
    "function": "linalg.eigen",
    "args": [[[4, 2], [2, 3]]]
  }
}
```

### Reading Function Card

1. Read `/ai/function_cards/linalg_eigen.json` for function specification
2. Validate input against the type map in `/ai/type_map.json`
3. Generate the appropriate call for the target interface
4. Parse and interpret the result

## Expected Output

For the matrix `[[4, 2], [2, 3]]`:

| Property | Value |
|----------|-------|
| λ₁ | 5.236 (≈ 3 + √5) |
| λ₂ | 1.764 (≈ 3 - √5) |
| v₁ | [0.789, 0.615] (normalized) |
| v₂ | [-0.615, 0.789] (normalized) |

## Mathematical Background

The eigenvalue equation Av = λv can be rewritten as (A - λI)v = 0.

For non-trivial solutions, det(A - λI) = 0, giving us the characteristic equation:

```
det | 4-λ   2  |  = (4-λ)(3-λ) - 4 = λ² - 7λ + 8 = 0
    |  2   3-λ |
```

Solving: λ = (7 ± √(49-32))/2 = (7 ± √17)/2 ≈ 5.236 or 1.764

## Type Flow Through the Bridge

```
JavaScript: number[][]
     ↓
PROTOCOL-JULIA.js: Convert to Julia column-major
     ↓
Julia: Matrix{Float64}
     ↓
LinearAlgebra.eigen()
     ↓
Julia: Eigen{Float64, Vector{ComplexF64}, Matrix{ComplexF64}}
     ↓
NovaJulia.jl: Convert to bridge types
     ↓
PROTOCOL-JULIA.js: Convert to JavaScript
     ↓
JavaScript: EigenResult { values: ComplexNum[], vectors: ComplexNum[][] }
```

## Proof Recording

When proof recording is enabled, each computation creates a record:

```json
{
  "id": "julia_1621234567890_abc123",
  "function": "linalg.eigen",
  "inputTypes": ["Matrix{Float64}"],
  "outputType": "EigenResult",
  "inputHash": "sha256:...",
  "outputHash": "sha256:...",
  "computeTimeMs": 12.34,
  "timestamp": 1621234567890,
  "phiEnhanced": false
}
```

This proof can be stored on-chain for verifiable computation records.

## Error Handling

### Non-Square Matrix
```javascript
const result = await julia.eigen([[1, 2, 3], [4, 5, 6]])
// Error: Matrix must be square
```

### Empty Matrix
```javascript
const result = await julia.eigen([])
// Error: Empty matrix
```

### Bridge Not Ready
```javascript
const julia = getJuliaCompute()
// Forgot to call initialize()
const result = await julia.eigen(matrix)
// Error: Bridge not ready. Current state: uninitialized
```

Always call `await julia.initialize()` before making compute calls.
