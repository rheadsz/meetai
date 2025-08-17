'use strict';

/**
 * Test framework used: Node.js built-in test runner (node:test) with node:assert.
 * Rationale: No existing third-party test framework detected in the repository,
 * and this avoids introducing new dependencies while providing robust tests.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const pkgPath = path.join(process.cwd(), 'package.json');
const pkgStr = fs.readFileSync(pkgPath, 'utf8');

let pkg;
try {
  pkg = JSON.parse(pkgStr);
} catch (e) {
  throw new Error('Invalid package.json: ' + e.message);
}

function assertSemver(ver, label) {
  assert.match(
    ver,
    /^\^?\d+\.\d+\.\d+$/,
    `${label} should be a semver or caret range (got: ${ver})`
  );
}

function checkNoEmptyVersions(obj, label) {
  if (!obj) return;
  for (const [k, v] of Object.entries(obj)) {
    assert.ok(typeof v === 'string', `${label}.${k} version must be a string`);
    assert.ok(v.trim().length > 0, `${label}.${k} version must not be empty`);
    assert.notStrictEqual(v, 'latest', `${label}.${k} must not use "latest" tag`);
    assertSemver(v, `${label}.${k}`);
  }
}

function extractMajor(ver) {
  // Works for both exact pins (e.g. 15.3.2) and ranges (e.g. ^19.0.0)
  const m = ver.match(/(\d+)\./);
  return m ? Number(m[1]) : NaN;
}

describe('package.json configuration integrity', () => {
  test('basic metadata is present and valid', () => {
    assert.equal(pkg.name, 'meetai', 'name should be "meetai"');
    assert.match(pkg.version, /^\d+\.\d+\.\d+$/, 'version should be x.y.z');
    assert.equal(pkg.private, true, 'private should be true');
  });

  test('required scripts exist with correct commands', () => {
    assert.ok(pkg.scripts && typeof pkg.scripts === 'object', 'scripts should be an object');
    const expected = {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
      'db:push': 'drizzle-kit push',
      'db:studio': 'drizzle-kit studio',
    };
    for (const [k, v] of Object.entries(expected)) {
      assert.equal(pkg.scripts[k], v, `scripts.${k} should be "${v}"`);
    }
  });

  test('critical runtime dependencies use expected versions', () => {
    const deps = pkg.dependencies || {};
    // Next.js pinned (as per provided package.json)
    assert.equal(deps.next, '15.3.2', 'dependencies.next should be pinned to 15.3.2');

    // React and ReactDOM on major 19
    const reactRe = /^\^?19\.\d+\.\d+$/;
    assert.ok(deps.react, 'dependencies.react should exist');
    assert.ok(deps['react-dom'], 'dependencies["react-dom"] should exist');
    assert.match(deps.react, reactRe, 'dependencies.react should be major 19');
    assert.match(deps['react-dom'], reactRe, 'dependencies.react-dom should be major 19');

    // Selected additional critical deps by major
    if (deps['date-fns']) {
      assert.match(deps['date-fns'], /^\^?4\.\d+\.\d+$/, 'dependencies["date-fns"] should be major 4');
    }
    if (deps['zod']) {
      assert.match(deps['zod'], /^\^?4\.\d+\.\d+$/, 'dependencies.zod should be major 4');
    }
  });

  test('tooling and typings devDependencies have appropriate majors', () => {
    const dev = pkg.devDependencies || {};
    if (dev.typescript) {
      assert.match(dev.typescript, /^\^?5(\.\d+){0,2}$/, 'devDependencies.typescript should be major 5');
    }
    if (dev['@types/node']) {
      assert.match(dev['@types/node'], /^\^?20(\.\d+){0,2}$/, 'devDependencies["@types/node"] should be major 20');
    }
    if (dev['@types/react']) {
      assert.match(dev['@types/react'], /^\^?19(\.\d+){0,2}$/, 'devDependencies["@types/react"] should be major 19');
    }
    if (dev['@types/react-dom']) {
      assert.match(dev['@types/react-dom'], /^\^?19(\.\d+){0,2}$/, 'devDependencies["@types/react-dom"] should be major 19');
    }
    if (dev.eslint) {
      assert.match(dev.eslint, /^\^?9(\.\d+){0,2}$/, 'devDependencies.eslint should be major 9');
    }
    if (dev['eslint-config-next']) {
      assert.match(dev['eslint-config-next'], /^\d+\.\d+\.\d+$/, 'devDependencies["eslint-config-next"] should be an exact pin');
      assert.equal(dev['eslint-config-next'], '15.3.2', 'devDependencies["eslint-config-next"] should be pinned to 15.3.2');
    }
    if (dev.tailwindcss) {
      assert.match(dev.tailwindcss, /^\^?4(\.\d+){0,2}$/, 'devDependencies.tailwindcss should be major 4');
    }
    if (dev['@tailwindcss/postcss']) {
      assert.match(dev['@tailwindcss/postcss'], /^\^?4(\.\d+){0,2}$/, 'devDependencies["@tailwindcss/postcss"] should be major 4');
    }
    if (dev.tsx) {
      assert.match(dev.tsx, /^\^?4(\.\d+){0,2}$/, 'devDependencies.tsx should be major 4');
    }
  });

  test('no empty or "latest" versions in dependencies and devDependencies', () => {
    checkNoEmptyVersions(pkg.dependencies || {}, 'dependencies');
    checkNoEmptyVersions(pkg.devDependencies || {}, 'devDependencies');
  });

  test('react and react-dom majors are aligned', () => {
    const deps = pkg.dependencies || {};
    const reactVer = deps.react;
    const reactDomVer = deps['react-dom'];
    assert.ok(reactVer && reactDomVer, 'react and react-dom must be present');

    const rMaj = extractMajor(reactVer);
    const rdMaj = extractMajor(reactDomVer);
    assert.ok(Number.isFinite(rMaj), `Cannot parse major from react: ${reactVer}`);
    assert.ok(Number.isFinite(rdMaj), `Cannot parse major from react-dom: ${reactDomVer}`);
    assert.equal(rMaj, rdMaj, 'react and react-dom must share the same major version');
  });

  test('Next and eslint-config-next are exact pins (not ranges)', () => {
    const deps = pkg.dependencies || {};
    const dev = pkg.devDependencies || {};
    if (deps.next) {
      assert.match(deps.next, /^\d+\.\d+\.\d+$/, 'dependencies.next should be an exact version pin');
    }
    if (dev['eslint-config-next']) {
      assert.match(dev['eslint-config-next'], /^\d+\.\d+\.\d+$/, 'devDependencies["eslint-config-next"] should be an exact version pin');
    }
  });
});