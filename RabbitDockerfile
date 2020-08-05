FROM rabbitmq

COPY rabbitmq_delayed_message_exchange-3.8.0.ez .

RUN mv rabbitmq_delayed_message_exchange-3.8.0.ez plugins/

RUN rabbitmq-plugins enable rabbitmq_delayed_message_exchange