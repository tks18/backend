const express = require('express');

const router = express.Router();
const axios = require('axios');

// Local
const db = require('../../helpers/mongo');
const { gh_headers } = require('../../helpers/github-oauth');
const originCheck = require('../../helpers/checkOrigin');
const api = require('./api');

// Models
const Tokens = require('../../models/tokens');

router.post('/list', (req, res) => {
  if (originCheck(req.headers.origin)) {
    const { user } = req.body;
    if (user) {
      db.connect()
        .then(() => {
          Tokens.findOne(
            {
              type: 'access',
              website: 'github.com',
              scope: 'read:user,read:discussion,read:packages,public_repo',
            },
            (doc_error, access_token) => {
              if (!doc_error && access_token) {
                axios
                  .get(api.repo.list(user), {
                    headers: gh_headers(access_token.token),
                  })
                  .then((response) => {
                    if (response.status === 200 && response.data) {
                      res.status(200).json({
                        success: true,
                        repos: response.data,
                      });
                    } else {
                      res.status(500).json({
                        success: false,
                        error: 'Not able to fetch Repo List',
                      });
                    }
                  })
                  .catch((error) => {
                    res.status(500).json({
                      success: false,
                      error,
                    });
                  });
              } else {
                res.status(500).json({
                  success: false,
                  error: 'Unable to fetch Access Token',
                  additional_error: doc_error,
                });
              }
            },
          );
        })
        .catch((error) => {
          res.status(500).json({
            success: false,
            error,
          });
        });
    } else {
      res.status(404).json({
        success: false,
        error: 'Required Detail Not Sent - username',
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: 'Forbidden, Wrong way to Communicate',
    });
  }
});

router.post('/data', (req, res) => {
  if (originCheck(req.headers.origin)) {
    const { user } = req.body;
    const { repo } = req.body;
    if (user && repo) {
      db.connect()
        .then(() => {
          Tokens.findOne(
            {
              type: 'access',
              website: 'github.com',
              scope: 'read:user,read:discussion,read:packages,public_repo',
            },
            (doc_error, access_token) => {
              if (!doc_error && access_token) {
                axios
                  .get(api.repo.data(user, repo), {
                    headers: gh_headers(access_token.token),
                  })
                  .then((response) => {
                    if (response.status === 200 && response.data) {
                      res.status(200).json({
                        success: true,
                        ...response.data,
                      });
                    } else {
                      res.status(500).json({
                        success: false,
                        error: 'Not able to fetch Repo Data',
                      });
                    }
                  })
                  .catch((error) => {
                    res.status(500).json({
                      success: false,
                      error,
                    });
                  });
              } else {
                res.status(500).json({
                  success: false,
                  error: 'Unable to fetch Access Token',
                  additional_error: doc_error,
                });
              }
            },
          );
        })
        .catch((error) => {
          res.status(500).json({
            success: false,
            error,
          });
        });
    } else {
      res.status(404).json({
        success: false,
        error: 'Required data not Given - Repo name',
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: 'Forbidden, Wrong way to Communicate',
    });
  }
});

router.post('/branches', (req, res) => {
  if (originCheck(req.headers.origin)) {
    const { user } = req.body;
    const { repo } = req.body;
    if (user && repo) {
      db.connect()
        .then(() => {
          Tokens.findOne(
            {
              type: 'access',
              website: 'github.com',
              scope: 'read:user,read:discussion,read:packages,public_repo',
            },
            (doc_error, access_token) => {
              if (!doc_error && access_token) {
                axios
                  .get(api.repo.branches(user, repo), {
                    headers: gh_headers(access_token.token),
                  })
                  .then((response) => {
                    if (response.status === 200 && response.data) {
                      res.status(200).json({
                        success: true,
                        branches: response.data,
                      });
                    } else {
                      res.status(500).json({
                        success: false,
                        error: 'Not able to fetch Repo Branches',
                      });
                    }
                  })
                  .catch((error) => {
                    res.status(500).json({
                      success: false,
                      error,
                    });
                  });
              } else {
                res.status(500).json({
                  success: false,
                  error: 'Unable to fetch Access Token',
                  additional_error: doc_error,
                });
              }
            },
          );
        })
        .catch((error) => {
          res.status(500).json({
            success: false,
            error,
          });
        });
    } else {
      res.status(404).json({
        success: false,
        error: 'Required data not Given - Repo name',
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: 'Forbidden, Wrong way to Communicate',
    });
  }
});

router.post('/commits', (req, res) => {
  if (originCheck(req.headers.origin)) {
    const { user } = req.body;
    const { repo } = req.body;
    const { branch } = req.body;
    const { nos } = req.body;
    const { page } = req.body;
    if (user && repo && branch && nos && page) {
      db.connect()
        .then(() => {
          Tokens.findOne(
            {
              type: 'access',
              website: 'github.com',
              scope: 'read:user,read:discussion,read:packages,public_repo',
            },
            (doc_error, access_token) => {
              if (!doc_error && access_token) {
                axios
                  .get(api.repo.commits(user, repo), {
                    headers: gh_headers(access_token.token),
                    params: {
                      sha: branch,
                      per_page: nos,
                      page,
                    },
                  })
                  .then((response) => {
                    if (response.status === 200 && response.data) {
                      res.status(200).json({
                        success: true,
                        commits: response.data,
                      });
                    } else {
                      res.status(500).json({
                        success: false,
                        error: 'Not able to fetch Repo Commits',
                      });
                    }
                  })
                  .catch((error) => {
                    res.status(500).json({
                      success: false,
                      error,
                    });
                  });
              } else {
                res.status(500).json({
                  success: false,
                  error: 'Unable to fetch Access Token',
                  additional_error: doc_error,
                });
              }
            },
          );
        })
        .catch((error) => {
          res.status(500).json({
            success: false,
            error,
          });
        });
    } else {
      res.status(404).json({
        success: false,
        error: 'Required data not Given - repo, branch, nos, page',
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: 'Forbidden, Wrong way to Communicate',
    });
  }
});

router.post('/topics', (req, res) => {
  if (originCheck(req.headers.origin)) {
    const { user } = req.body;
    const { repo } = req.body;
    if (user && repo) {
      db.connect()
        .then(() => {
          Tokens.findOne(
            {
              type: 'access',
              website: 'github.com',
              scope: 'read:user,read:discussion,read:packages,public_repo',
            },
            (doc_error, access_token) => {
              if (!doc_error && access_token) {
                axios
                  .get(api.repo.topics(user, repo), {
                    headers: {
                      ...gh_headers(access_token.token),
                      Accept: 'application/vnd.github.mercy-preview+json',
                    },
                  })
                  .then((response) => {
                    if (response.status === 200 && response.data) {
                      res.status(200).json({
                        success: true,
                        ...response.data,
                      });
                    } else {
                      res.status(500).json({
                        success: false,
                        error: 'Not able to fetch Topics for the Given Repo',
                      });
                    }
                  })
                  .catch((error) => {
                    res.status(500).json({
                      success: false,
                      error,
                    });
                  });
              } else {
                res.status(500).json({
                  success: false,
                  error: 'Unable to fetch Access Token',
                  additional_error: doc_error,
                });
              }
            },
          );
        })
        .catch((error) => {
          res.status(500).json({
            success: false,
            error,
          });
        });
    } else {
      res.status(404).json({
        success: false,
        error: 'Required data not Given - Repo name',
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: 'Forbidden, Wrong way to Communicate',
    });
  }
});

router.post('/contents', (req, res) => {
  if (originCheck(req.headers.origin)) {
    const { user } = req.body;
    const { repo } = req.body;
    const { path } = req.body;
    const { branch } = req.body;
    if (user && repo && path && branch) {
      db.connect()
        .then(() => {
          Tokens.findOne(
            {
              type: 'access',
              website: 'github.com',
              scope: 'read:user,read:discussion,read:packages,public_repo',
            },
            (doc_error, access_token) => {
              if (!doc_error && access_token) {
                axios
                  .get(api.repo.contents(user, repo, path), {
                    headers: gh_headers(access_token.token),
                    params: {
                      ref: branch,
                    },
                  })
                  .then((response) => {
                    if (response.status === 200 && response.data) {
                      res.status(200).json({
                        success: true,
                        contents: response.data,
                      });
                    } else {
                      res.status(500).json({
                        success: false,
                        error: 'Not able to fetch Repo Contents',
                      });
                    }
                  })
                  .catch((error) => {
                    res.status(500).json({
                      success: false,
                      error,
                    });
                  });
              } else {
                res.status(500).json({
                  success: false,
                  error: 'Unable to fetch Access Token',
                  additional_error: doc_error,
                });
              }
            },
          );
        })
        .catch((error) => {
          res.status(500).json({
            success: false,
            error,
          });
        });
    } else {
      res.status(404).json({
        success: false,
        error: 'Required data not Given - Repo, Path, Branch',
      });
    }
  } else {
    res.status(401).json({
      success: false,
      message: 'Forbidden, Wrong way to Communicate',
    });
  }
});

module.exports = router;
