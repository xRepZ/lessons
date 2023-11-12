FROM node:18-alpine
    
ENV APP_DIR=/app
    
WORKDIR $APP_DIR
    
COPY . .
  
RUN yarn

USER node
    
CMD yarn run start