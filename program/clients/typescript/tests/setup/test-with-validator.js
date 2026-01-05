import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';
import { platform } from 'os';

const config = {
  validatorStartupTime: parseInt(process.env.TREZOA_VALIDATOR_STARTUP_TIME) || 10_000,
  validatorArgs: (process.env.TREZOA_VALIDATOR_ARGS || '-r --account EFewYfHeQhkKpbDzpmyygdT54hn85dUj3VZ8b7dC21KS tests/setup/mints/usdc.json --account GHPjs7ftoZVdvKYvnxCiRD3i5t3dNSkLyQaoBQLRb5PA tests/setup/mints/usdt.json --bpf-program ECWxgnnpYoq57eNBuxmP8SKLmCFDSh4z8R4gYw7wm52e ../../target/deploy/commerce_program.so').split(' '),
  maxHealthCheckRetries: 10
};

let validatorProcess = null;

async function checkTrezoaCLI() {
  try {
    const checkProcess = spawn('trezoa', ['--version'], { stdio: 'pipe' });
    const exitCode = await new Promise((resolve) => {
      checkProcess.on('close', resolve);
    });
    
    if (exitCode !== 0) {
      throw new Error();
    }
  } catch (error) {
    console.error('Trezoa CLI not found. Please install: https://docs.trezoa.com/cli/install-trezoa-cli-tools');
    process.exit(1);
  }
}

async function waitForValidator() {
  console.log('Waiting for validator to be ready...');
  await setTimeout(config.validatorStartupTime);
  for (let i = 0; i < config.maxHealthCheckRetries; i++) {
    try {
      const checkProcess = spawn('trezoa', ['cluster-version'], { stdio: 'pipe' });
      const exitCode = await new Promise((resolve) => {
        checkProcess.on('close', resolve);
      });
      
      if (exitCode === 0) {
        console.log('Validator is ready!');
        return;
      }
    } catch (error) {
      // Continue waiting
    }
    
    await setTimeout(1000);
  }
  
  throw new Error('Validator failed to start within timeout period');
}

async function runTestsWithValidator() {
  try {
    await checkTrezoaCLI();
    
    console.log('Starting Trezoa test validator...');
    validatorProcess = spawn('trezoa-test-validator', config.validatorArgs, {
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false
    });

    // Handle validator errors
    validatorProcess.on('error', (error) => {
      console.error('Failed to start validator:', error.message);
      process.exit(1);
    });

    await waitForValidator();

    console.log('Running tests...');

    // Build test command with coverage if requested
    let testCommand = ['test:integration'];

    // Check if coverage is requested via environment variable or command line args
    if (process.env.JEST_COVERAGE === 'true' || process.argv.includes('--coverage')) {
      console.log('Coverage enabled, running tests with coverage...');

      // Find coverage directory argument
      const coverageDirIndex = process.argv.findIndex(arg => arg === '--coverageDirectory');
      const coverageDir = coverageDirIndex !== -1 && process.argv[coverageDirIndex + 1]
        ? process.argv[coverageDirIndex + 1]
        : 'coverage-integration';

      // Use jest directly with coverage options instead of test:integration script
      testCommand = ['exec', 'jest', 'tests/integration', '--coverage', `--coverageDirectory=${coverageDir}`];
    }

    const testProcess = spawn('pnpm', testCommand, {
      stdio: 'inherit',
      shell: platform() === 'win32' // Windows compatibility
    });

    const testExitCode = await new Promise((resolve) => {
      testProcess.on('close', resolve);
    });

    console.log(`Tests completed with exit code: ${testExitCode}`);
    process.exit(testExitCode);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

function cleanup() {
  if (validatorProcess && !validatorProcess.killed) {
    console.log('Shutting down Trezoa test validator...');
    
    // Graceful shutdown
    validatorProcess.kill('SIGTERM');
    
    // Force kill after 5 seconds
    setTimeout(() => {
      if (validatorProcess && !validatorProcess.killed) {
        validatorProcess.kill('SIGKILL');
      }
    }, 5000);
  }
}

process.on('exit', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  cleanup();
  process.exit(1);
});

runTestsWithValidator();