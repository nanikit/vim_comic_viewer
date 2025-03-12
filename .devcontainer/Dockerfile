FROM mcr.microsoft.com/devcontainers/base:1.2.3-ubuntu24.04

RUN curl -fsSL https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt update && \
  apt install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

COPY --from=denoland/deno:bin /deno /usr/bin/deno
