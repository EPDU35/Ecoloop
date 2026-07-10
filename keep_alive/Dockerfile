FROM alpine:3.19

RUN apk add --no-cache curl bash

COPY ping.sh /ping.sh
RUN chmod +x /ping.sh

CMD ["/ping.sh"]
