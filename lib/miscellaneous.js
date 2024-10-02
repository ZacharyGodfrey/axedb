export const sort = {
  byAscending: (selector) => {
    return (left, right) => {
      const l = selector(left);
      const r = selector(right);

      return l < r ? -1 : l > r ? 1 : 0;
    };
  },
  byDescending: (selector) => {
    return (left, right) => {
      const l = selector(left);
      const r = selector(right);

      return r < l ? -1 : r > l ? 1 : 0;
    };
  }
};