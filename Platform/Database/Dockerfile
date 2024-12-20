FROM mysql:latest

ENV MYSQL_ROOT_PASSWORD=pi3141592
ENV MYSQL_DATABASE=monitoring

COPY init.sql /docker-entrypoint-initdb.d/

EXPOSE 3306

VOLUME /var/lib/mysql