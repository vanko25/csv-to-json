FROM ellerbrock/alpine-bash-curl-ssl
COPY ./docker /
WORKDIR /
CMD ["bash", "/uploadcsv.sh"]
