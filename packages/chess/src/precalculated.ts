function top_left_diagonal_bit_mask(position: number) {
  let positions: number[] = [];
  let bit_mask = 0n;

  let row = Math.floor(position / 8);
  let col = position % 8;

  while (0 <= row && row <= 7 && 0 <= col && col <= 7) {
    if (row * 8 + col != position) {
      positions.push(row * 8 + col);
    }

    row--;
    col--;
  }

  positions.forEach((position) => {
    bit_mask |= 1n << BigInt(63 - position);
  });

  return bit_mask;
}

function top_right_diagonal_bit_mask(position: number) {
  let positions: number[] = [];
  let bit_mask = 0n;

  let row = Math.floor(position / 8);
  let col = position % 8;

  while (0 <= row && row <= 7 && 0 <= col && col <= 7) {
    if (row * 8 + col != position) {
      positions.push(row * 8 + col);
    }

    row--;
    col++;
  }

  positions.forEach((position) => {
    bit_mask |= 1n << BigInt(63 - position);
  });

  return bit_mask;
}

function bottom_left_diagonal_bit_mask(position: number) {
  let positions: number[] = [];
  let bit_mask = 0n;

  let row = Math.floor(position / 8);
  let col = position % 8;

  while (0 <= row && row <= 7 && 0 <= col && col <= 7) {
    if (row * 8 + col != position) {
      positions.push(row * 8 + col);
    }

    row++;
    col--;
  }

  positions.forEach((position) => {
    bit_mask |= 1n << BigInt(63 - position);
  });

  return bit_mask;
}

function bottom_right_diagonal_bit_mask(position: number) {
  let positions: number[] = [];
  let bit_mask = 0n;

  let row = Math.floor(position / 8);
  let col = position % 8;

  while (0 <= row && row <= 7 && 0 <= col && col <= 7) {
    if (row * 8 + col != position) {
      positions.push(row * 8 + col);
    }

    row++;
    col++;
  }

  positions.forEach((position) => {
    bit_mask |= 1n << BigInt(63 - position);
  });

  return bit_mask;
}

function up_bit_mask(position: number) {
  let positions: number[] = [];
  let bit_mask = 0n;

  let row = Math.floor(position / 8);
  let col = position % 8;

  while (0 <= row && row <= 7 && 0 <= col && col <= 7) {
    if (row * 8 + col != position) {
      positions.push(row * 8 + col);
    }

    row--;
  }

  positions.forEach((position) => {
    bit_mask |= 1n << BigInt(63 - position);
  });

  return bit_mask;
}

function down_bit_mask(position: number) {
  let positions: number[] = [];
  let bit_mask = 0n;

  let row = Math.floor(position / 8);
  let col = position % 8;

  while (0 <= row && row <= 7 && 0 <= col && col <= 7) {
    if (row * 8 + col != position) {
      positions.push(row * 8 + col);
    }

    row++;
  }

  positions.forEach((position) => {
    bit_mask |= 1n << BigInt(63 - position);
  });

  return bit_mask;
}

function left_bit_mask(position: number) {
  let positions: number[] = [];
  let bit_mask = 0n;

  let row = Math.floor(position / 8);
  let col = position % 8;

  while (0 <= row && row <= 7 && 0 <= col && col <= 7) {
    if (row * 8 + col != position) {
      positions.push(row * 8 + col);
    }

    col--;
  }

  positions.forEach((position) => {
    bit_mask |= 1n << BigInt(63 - position);
  });

  return bit_mask;
}

function right_bit_mask(position: number) {
  let positions: number[] = [];
  let bit_mask = 0n;

  let row = Math.floor(position / 8);
  let col = position % 8;

  while (0 <= row && row <= 7 && 0 <= col && col <= 7) {
    if (row * 8 + col != position) {
      positions.push(row * 8 + col);
    }

    col++;
  }

  positions.forEach((position) => {
    bit_mask |= 1n << BigInt(63 - position);
  });

  return bit_mask;
}

function knight_bit_mask(position: number) {
  let positions: number[] = [];
  let bit_mask = 0n;

  let row = Math.floor(position / 8);
  let col = position % 8;

  if (row - 2 >= 0 && col + 1 <= 7) {
    positions.push(position - 15);
  }

  if (row - 1 >= 0 && col + 2 <= 7) {
    positions.push(position - 6);
  }

  if (row + 1 <= 7 && col + 2 <= 7) {
    positions.push(position + 10);
  }

  if (row + 2 <= 7 && col + 1 <= 7) {
    positions.push(position + 17);
  }

  if (row + 2 <= 7 && col - 1 >= 0) {
    positions.push(position + 15);
  }

  if (row + 1 <= 7 && col - 2 >= 0) {
    positions.push(position + 6);
  }

  if (row - 1 >= 0 && col - 2 >= 0) {
    positions.push(position - 10);
  }

  if (row - 2 >= 0 && col - 1 >= 0) {
    positions.push(position - 17);
  }

  positions.forEach((position) => {
    bit_mask |= 1n << BigInt(63 - position);
  });

  return bit_mask;
}

function white_king_pawn_bit_mask(position: number) {
  let positions: number[] = [];
  let bit_mask = 0n;

  let row = Math.floor(position / 8);
  let col = position % 8;

  if (row - 1 > 0 && col + 1 <= 7) {
    positions.push(position - 7);
  }

  if (row - 1 > 0 && col - 1 >= 0) {
    positions.push(position - 9);
  }

  positions.forEach((position) => {
    bit_mask |= 1n << BigInt(63 - position);
  });

  return bit_mask;
}

function black_king_pawn_bit_mask(position: number) {
  let positions: number[] = [];
  let bit_mask = 0n;

  let row = Math.floor(position / 8);
  let col = position % 8;

  if (row + 1 < 7 && col + 1 <= 7) {
    positions.push(position + 9);
  }

  if (row + 1 < 7 && col - 1 >= 0) {
    positions.push(position + 7);
  }

  positions.forEach((position) => {
    bit_mask |= 1n << BigInt(63 - position);
  });

  return bit_mask;
}

function king_bit_mask(position: number) {
  let positions: number[] = [];
  let bit_mask = 0n;

  let row = Math.floor(position / 8);
  let col = position % 8;

  if (row - 1 >= 0) {
    positions.push(position - 8);
  }

  if (row - 1 >= 0 && col + 1 <= 7) {
    positions.push(position - 7);
  }

  if (col + 1 <= 7) {
    positions.push(position + 1);
  }

  if (row + 1 <= 7 && col + 1 <= 7) {
    positions.push(position + 9);
  }

  if (row + 1 <= 7) {
    positions.push(position + 8);
  }

  if (row + 1 <= 7 && col - 1 >= 0) {
    positions.push(position + 7);
  }

  if (col - 1 >= 0) {
    positions.push(position - 1);
  }

  if (row - 1 >= 0 && col - 1 >= 0) {
    positions.push(position - 9);
  }

  positions.forEach((position) => {
    bit_mask |= 1n << BigInt(63 - position);
  });

  return bit_mask;
}

let TOP_LEFT_DIAGONAL_BIT_MASK: bigint[] = [];
let TOP_RIGHT_DIAGONAL_BIT_MASK: bigint[] = [];
let BOTTOM_LEFT_DIAGONAL_BIT_MASK: bigint[] = [];
let BOTTOM_RIGHT_DIAGONAL_BIT_MASK: bigint[] = [];

let UP_BIT_MASK: bigint[] = [];
let DOWN_BIT_MASK: bigint[] = [];
let LEFT_BIT_MASK: bigint[] = [];
let RIGHT_BIT_MASK: bigint[] = [];

let KNIGHT_BIT_MASK: bigint[] = [];
let WHITE_KING_PAWN_BIT_MASK: bigint[] = [];
let BLACK_KING_PAWN_BIT_MASK: bigint[] = [];

let KING_BIT_MASK: bigint[] = [];

for (let i = 0; i < 64; i++) {
  TOP_LEFT_DIAGONAL_BIT_MASK.push(top_left_diagonal_bit_mask(i));
  TOP_RIGHT_DIAGONAL_BIT_MASK.push(top_right_diagonal_bit_mask(i));
  BOTTOM_LEFT_DIAGONAL_BIT_MASK.push(bottom_left_diagonal_bit_mask(i));
  BOTTOM_RIGHT_DIAGONAL_BIT_MASK.push(bottom_right_diagonal_bit_mask(i));

  UP_BIT_MASK.push(up_bit_mask(i));
  DOWN_BIT_MASK.push(down_bit_mask(i));
  LEFT_BIT_MASK.push(left_bit_mask(i));
  RIGHT_BIT_MASK.push(right_bit_mask(i));

  KNIGHT_BIT_MASK.push(knight_bit_mask(i));

  WHITE_KING_PAWN_BIT_MASK.push(white_king_pawn_bit_mask(i));
  BLACK_KING_PAWN_BIT_MASK.push(black_king_pawn_bit_mask(i));

  KING_BIT_MASK.push(king_bit_mask(i));
}

export {
  TOP_LEFT_DIAGONAL_BIT_MASK,
  TOP_RIGHT_DIAGONAL_BIT_MASK,
  BOTTOM_LEFT_DIAGONAL_BIT_MASK,
  BOTTOM_RIGHT_DIAGONAL_BIT_MASK,
  UP_BIT_MASK,
  DOWN_BIT_MASK,
  LEFT_BIT_MASK,
  RIGHT_BIT_MASK,
  KNIGHT_BIT_MASK,
  WHITE_KING_PAWN_BIT_MASK,
  BLACK_KING_PAWN_BIT_MASK,
  KING_BIT_MASK,
};
