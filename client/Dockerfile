FROM nginx

RUN rm /etc/nginx/conf.d/default.conf

COPY dist /usr/share/nginx/html
COPY default.conf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/nginx.conf