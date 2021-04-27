const express = require('express');

const router = express.Router();

// Local
const { gh_request } = require('../../helpers/github-oauth');
const api = require('./api');

router.post('/list', (req, res) => {
  const { user } = req.body;
  if (user) {
    gh_request({
      url: api.repo.list(user),
      res,
      keyword: 'repos',
      special_headers: null,
      parameters: null,
      spread: false,
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Required Detail Not Sent - username',
    });
  }
});

router.post('/data', (req, res) => {
  const { user } = req.body;
  const { repo } = req.body;
  if (user && repo) {
    gh_request({
      url: api.repo.data(user, repo),
      res,
      keyword: 'data',
      special_headers: null,
      parameters: null,
      spread: true,
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Required data not Given - Repo name',
    });
  }
});

router.post('/branches', (req, res) => {
  const { user } = req.body;
  const { repo } = req.body;
  if (user && repo) {
    gh_request({
      url: api.repo.branches(user, repo),
      res,
      keyword: 'branches',
      special_headers: null,
      parameters: null,
      spread: false,
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Required data not Given - Repo name',
    });
  }
});

router.post('/commits', (req, res) => {
  const { user } = req.body;
  const { repo } = req.body;
  const { branch } = req.body;
  const { nos } = req.body;
  const { page } = req.body;
  if (user && repo && branch && nos && page) {
    gh_request({
      url: api.repo.commits(user, repo),
      res,
      keyword: 'commits',
      special_headers: null,
      parameters: {
        sha: branch,
        per_page: nos,
        page,
      },
      spread: false,
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Required data not Given - repo, branch, nos, page',
    });
  }
});

router.post('/topics', (req, res) => {
  const { user } = req.body;
  const { repo } = req.body;
  if (user && repo) {
    gh_request({
      url: api.repo.topics(user, repo),
      res,
      keyword: 'topics',
      special_headers: {
        Accept: 'application/vnd.github.mercy-preview+json',
      },
      parameters: null,
      spread: true,
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Required data not Given - Repo name',
    });
  }
});

router.post('/contents', (req, res) => {
  const { user } = req.body;
  const { repo } = req.body;
  const { path } = req.body;
  const { branch } = req.body;
  if (user && repo && path && branch) {
    gh_request({
      url: api.repo.contents(user, repo, path),
      res,
      keyword: 'Contents',
      special_headers: null,
      parameters: {
        ref: branch,
      },
      spread: false,
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Required data not Given - Repo, Path, Branch',
    });
  }
});

module.exports = router;
