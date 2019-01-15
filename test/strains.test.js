/*
 * Copyright 2018 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-env mocha */

const assert = require('assert');
const path = require('path');
const GitUrl = require('../src/GitUrl.js');
const { HelixConfig } = require('../src/index.js');

const SPEC_ROOT = path.resolve(__dirname, 'specs/configs');

describe('Strains test', () => {
  it('finds strains match default code repository', async () => {
    const cfg = await new HelixConfig()
      .withConfigPath(path.resolve(SPEC_ROOT, 'many-code-repos.yaml'))
      .init();
    const strains = cfg.strains.filterByCode(new GitUrl('https://github.com/adobe/project-helix.io.git#master'));
    assert.deepEqual(strains.map(s => s.name), ['default']);
  });

  it('finds strains match dev repository', async () => {
    const cfg = await new HelixConfig()
      .withConfigPath(path.resolve(SPEC_ROOT, 'many-code-repos.yaml'))
      .init();
    const strains = cfg.strains.filterByCode(new GitUrl('https://github.com/adobe/project-helix.io.git#dev'));
    assert.deepEqual(strains.map(s => s.name), ['dev', 'dev2']);
  });

  it('finds no strains match foo repository', async () => {
    const cfg = await new HelixConfig()
      .withConfigPath(path.resolve(SPEC_ROOT, 'many-code-repos.yaml'))
      .init();
    const strains = cfg.strains.filterByCode(new GitUrl('https://github.com/adobe/foo.git#master'));
    assert.equal(strains.length, 0);
  });

  it('finds one proxy strain', async () => {
    const cfg = await new HelixConfig()
      .withConfigPath(path.resolve(SPEC_ROOT, 'many-code-repos.yaml'))
      .init();
    const strains = cfg.strains.getProxyStrains();
    assert.equal(strains.length, 1);
  });

  it('finds some runtime strains', async () => {
    const cfg = await new HelixConfig()
      .withConfigPath(path.resolve(SPEC_ROOT, 'many-code-repos.yaml'))
      .init();
    const strains = cfg.strains.getRuntimeStrains();
    assert.equal(strains.length, 4);
  });

  it('get a strain', async () => {
    const cfg = await new HelixConfig()
      .withConfigPath(path.resolve(SPEC_ROOT, 'many-code-repos.yaml'))
      .init();
    assert.equal(cfg.strains.get('default').name, 'default');
  });

  it('has a strain', async () => {
    const cfg = await new HelixConfig()
      .withConfigPath(path.resolve(SPEC_ROOT, 'many-code-repos.yaml'))
      .init();
    assert.equal(cfg.strains.has('default'), true);
  });

  it('size of strains', async () => {
    const cfg = await new HelixConfig()
      .withConfigPath(path.resolve(SPEC_ROOT, 'many-code-repos.yaml'))
      .init();
    assert.equal(cfg.strains.size, 5);
  });

  it('forEach of strains', async () => {
    const cfg = await new HelixConfig()
      .withConfigPath(path.resolve(SPEC_ROOT, 'many-code-repos.yaml'))
      .init();
    const names = [];
    cfg.strains.forEach((s) => { names.push(s.name); });
    assert.deepEqual(names, ['default', 'dev', 'dev2', 'stage', 'proxy']);
  });

  it('clone single strain', async () => {
    const cfg = await new HelixConfig()
      .withConfigPath(path.resolve(SPEC_ROOT, 'clone-tests.yaml'))
      .init();
    const copy = cfg.strains.get('default').clone();
    assert.deepEqual(copy.toYAML(), 'default:\n'
      + '  code: \'https://github.com/adobe/project-helix.io.git#master\'\n'
      + '  content:\n'
      + '    protocol: https\n'
      + '    host: github.com\n'
      + '    hostname: github.com\n'
      + '    owner: adobe\n'
      + '    repo: helix-cli\n'
      + '    ref: master\n'
      + '  static: \'https://github.com/adobe/project-helix.io.git/htdocs#dev\'\n'
      + '  directoryIndex: readme.html\n'
      + '  condition: req.http.host == "client.project-helix.io"\n');
  });
});
