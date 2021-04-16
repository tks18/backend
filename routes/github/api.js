const api = {
  repo: {
    list: (user) =>
      `https://api.github.com/users/${user}/repos?sort=updated&per_page=20`,
    data: (user, repo) => `https://api.github.com/repos/${user}/${repo}`,
    topics: (user, repo) =>
      `https://api.github.com/repos/${user}/${repo}/topics`,
    contents: (user, repo, path) =>
      `https://api.github.com/repos/${user}/${repo}/contents${path}`,
    branches: (user, repo) =>
      `https://api.github.com/repos/${user}/${repo}/branches`,
    commits: (user, repo) =>
      `https://api.github.com/repos/${user}/${repo}/commits`,
  },
};

module.exports = api;
