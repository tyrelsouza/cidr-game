# CIDR Game Quiz

Have you ever wanted to practice calculating CIDR base IPs?
Look no further.

Really quick quiz game that keeps track of correct/incorrect guesses.

## Node Server

```bash
npm run node
```

### Kubernetes

Start Minikube, build the server image inside Minikube, and apply the manifests:

```bash
minikube start
minikube image build -t cidr-game-node:latest .
minikube kubectl -- apply -k k8s/
```

The API uses an internal ClusterIP service. In a second terminal, forward it to
your local machine:

```bash
minikube kubectl -- port-forward service/cidr-node 3000:3000
```

The API is then available at `http://localhost:3000`. You can check it with:

```bash
curl http://localhost:3000/healthz
```

## Front End

### Vue3 Server

```bash
npm run vue
```

### React Server

```bash
npm run react
```

Open the React app at `http://localhost:5155`. Keep the Kubernetes port-forward
running so the Vite development proxy can reach the Node API at
`http://localhost:3000`.

### Static builds

Build both frontend apps into their workspace `dist/` directories:

```bash
npm run build:static
```

Build or preview either app independently with `npm run build:react`,
`npm run build:vue`, `npm run preview:react`, or `npm run preview:vue`.

The generated apps are configured for `/react/` and `/vue/` respectively. Host
`apps/react/dist/` at `/react` and `apps/vue/dist/` at `/vue`.

Production builds call the API directly and the Node API allows requests
from `https://cidr-game.bureauofsidequests.com`. Local development continues to
use the Vite API proxy.

### Tests
```bash
npm run test:watch
```

#  FAQ

1. Why is this so convoluted? I wanted to get some easy node/express practice, TypeScript, etc.
I have done Vue3 in the past but not in a few years and don't have anything to show for it repository wise. React is new to me for greenfield work, I've only worked in existing repositories, so I learned how Vite, etc work together.
1. Could this all have just been one JS file with no SPA? Sure! But then I wouldn't have the SPA or node practice.
1. Why do they look _awful_? I'm a backend dev primarily, I have never taken a minute of proper design or color theory, you get what you get. 
