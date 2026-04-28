import axios from 'axios';

jest.mock('axios');

(axios.get as jest.Mock).mockResolvedValue({
  data: {
    price: 100,
    open_price: 90,
    prev_close_price: 95,
    conversion_rates: {INR: 80},
  },
});