const axios = require('axios');

async function hashnodeQuery(query, variables = {}) {
  try {
    const response = await axios.post(
      'https://api.hashnode.com/',
      {
        query,
        variables,
      },
      {
        Headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (response.status === 200) {
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    }
    return {
      success: false,
      data: null,
      error: null,
    };
  } catch (e) {
    return {
      success: false,
      data: null,
      error: String(e),
    };
  }
}

module.exports = async function blogQuery() {
  const queryConstant = `
    query GetArticles($page: Int!) {
        user(username: "tks18") {
            publicationDomain
            publication {
                posts(page: $page) {
                    title
                    dateAdded
                    coverImage
                    slug
                }
            }
        }
    }
  `;
  const data = await hashnodeQuery(queryConstant, { page: 0 });
  return data;
};
