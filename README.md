# CIDR Game Quiz

Have you ever wanted to practice calculating CIDR base IPs?
Look no further.

Really quick quiz game that keeps track of correct/incorrect guesses.

## Node Server

```bash
npm run node
```

### Kubernetes

Build the server image from the repository root and apply the manifests:

```bash
docker build -t cidr-game-node:latest .
kubectl apply -k k8s/
```

The API is available inside the cluster at `http://cidr-node:3000`.

## Front End

### Vue3 Server

```bash
npm run vue
```

### React Server

```bash
npm run react
```

### Tests
```bash
npm run test:watch
```

#  FAQ

1. Why is this so convoluted? I wanted to get some easy node/express practice, TypeScript, etc.
I have done Vue3 in the past but not in a few years and don't have anything to show for it repository wise. React is new to me for greenfield work, I've only worked in existing repositories, so I learned how Vite, etc work together.
1. Could this all have just been one JS file with no SPA? Sure! But then I wouldn't have the SPA or node practice.
1. Why do they look _awful_? I'm a backend dev primarily, I have never taken a minute of proper design or color theory, you get what you get. 
