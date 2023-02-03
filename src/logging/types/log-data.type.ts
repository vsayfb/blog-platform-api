export type LogData = {
  client_id: string | 'guest';
  request_method: string;
  request_url: string;
  start_time: Date;
  end_time: Date;
  response_time: string;
  exception?: any;
};
