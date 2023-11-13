<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->

<a name="readme-top"></a>

<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![MIT License][license-shield]][license-url]

[![Test Status][test-badge-url]][test-workflow-url]

<p>
  <a href="https://github.com/helsingborg-stad/haffa-backend">
    <img src="docs/images/hbg-github-logo-combo.png" alt="Logo" width="300">
  </a>
</p>
<h1>Haffa backend</h1>
<p>
  Haffa backend broker för authentication and data
  <br />
  <a href="https://github.com/helsingborg-stad/haffa-backend/issues">Report Bug</a>
  ·
  <a href="https://github.com/helsingborg-stad/haffa-backend/issues">Request Feature</a>
</p>

#

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
      </ul>
    </li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

This is a project template for GDI server applications.
As such, it includes

- a microframework based on [koa](https://koajs.com/), [openapi-backend](https://github.com/anttiviljami/openapi-backend), [koa2-swagger-ui](https://github.com/scttcper/koa2-swagger-ui) and more
- best practices such as OpenAPI/Swagger
- GraphQL support
- Great testability

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Integrations

haffa-backend works with different storage and service providers including in memory, disk and MongoDB.

Check out our [integration guide](./integrations/readme.md) for more info.

## Getting Started

### Configuration

Make sure you have the file `.env` in your project root. For its contents, refer to samples in [.env.example](./.env.example)

### Build and run

```sh
# install dependencies
yarn

# run tests
yarn test

# run tests and report coverage
yarn coverage

# start web server
yarn start

# start server on port 8080 instead of default 4000
PORT=8080 yarn start

# start with debugging output
DEBUG=* yarn start

```

## Run with Docker:

```sh
# Replace access_token_from_github with your developer token)
export GITHUB_ACCESS_TOKEN=<access_token_from_github>

# Run Docker
docker-compose up
```

### Testing endpoints

- [OpenAPI endpoint](http://localhost:4000)
- [GraphQL endpoint](https://cloud.hasura.io/public/graphiql?endpoint=http%3A%2F%2Flocalhost%3A4000%2Fapi%2Fv1%2Fhaffa%2Fgraphql)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Prerequisites

- [nodejs](https://nodejs.org/en/)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

## Roadmap

- [ ] Feature 1
- [ ] Feature 2
- [ ] Feature 3
  - [ ] Nested Feature

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

- [Best-README-Template](https://github.com/othneildrew/Best-README-Template)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[license-shield]: https://img.shields.io/github/license/helsingborg-stad/haffa-backend.svg?style=for-the-badge
[license-url]: https://github.com/helsingborg-stad/haffa-backend/blob/master/LICENSE.txt
[test-badge-url]: https://github.com/helsingborg-stad/haffa-backend/actions/workflows/automatic-tests.yml/badge.svg
[test-workflow-url]: https://github.com/helsingborg-stad/haffa-backend/actions/workflows/automatic-tests.yml
