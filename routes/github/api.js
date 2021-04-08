let api = {
  repo: {
    list: 'https://api.github.com/users/tks18/repos?sort=updated&per_page=20',
    data: (repo) => `https://api.github.com/repos/tks18/${repo}`,
    topics: (repo) => `https://api.github.com/repos/tks18/${repo}/topics`,
    contents: (repo, path) =>
      `https://api.github.com/repos/tks18/${repo}/contents${path}`,
    branches: (repo) => `https://api.github.com/repos/tks18/${repo}/branches`,
    commits: (repo) => `https://api.github.com/repos/tks18/${repo}/commits`,
  },
};

module.exports = api;
