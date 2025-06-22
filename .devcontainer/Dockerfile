# Use the official Node.js image as base
FROM mcr.microsoft.com/devcontainers/typescript-node:1-20-bullseye

# Install additional packages
RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends \
        git \
        curl \
        wget \
        unzip \
        vim \
        nano \
        tree \
        jq \
        htop \
    && apt-get autoremove -y && apt-get clean -y && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm@9

# Set up shell aliases for convenience
RUN echo 'alias ll="ls -alF"' >> /home/node/.bashrc \
    && echo 'alias la="ls -A"' >> /home/node/.bashrc \
    && echo 'alias l="ls -CF"' >> /home/node/.bashrc \
    && echo 'alias ..="cd .."' >> /home/node/.bashrc \
    && echo 'alias ...="cd ../.."' >> /home/node/.bashrc \
    && echo 'alias dev="pnpm dev"' >> /home/node/.bashrc \
    && echo 'alias build="pnpm build"' >> /home/node/.bashrc \
    && echo 'alias test="pnpm test"' >> /home/node/.bashrc \
    && echo 'alias lint="pnpm check"' >> /home/node/.bashrc

# Set working directory
WORKDIR /workspace

# Copy package files for dependency caching
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Set proper ownership
RUN chown -R node:node /workspace

# Switch to node user
USER node 