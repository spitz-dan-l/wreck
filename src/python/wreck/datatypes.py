from collections import namedtuple
import abc
from enum import IntEnum

Dangle = namedtuple('Dangle', ['partition', 'edges', 'fixed_face', 'free_face'])

class Matrix2:
    def __init__(self, data):
        self.data = [row[:] for row in data]

    def __getitem__(self, pt):
        x, y = pt
        return self.data[y][x]

    def __setitem__(self, pt, val):
        x, y = pt
        self.data[y][x] = val

    def rotate(self, degrees):
        if degrees == 360 or degrees == 0:
            return self

        n_rotations = degrees // 90

        dim_x = len(self.data[0])
        dim_y = len(self.data)

        m = self
        for i in range(n_rotations):
            new_data = []
            for y in range(dim_y):
                row = []
                for x in range(dim_x):
                    row.append(m[y, dim_x - 1 - x])
                new_data.append(row)
            m = Matrix2(new_data)

        return m

    def __contains__(self, x):
        return any(x in row for row in self.data)

class CardboardEdge(IntEnum):
    intact = 0
    cut = 1

class TapeEdge(IntEnum):
    untaped = 0
    taped = 1
    cut = 2

class EdgeState:
    def __init__(self, cardboard=None, tape=None):
        if cardboard is None:
            cardboard = CardboardEdge.intact
        self.cardboard = cardboard

        if tape is None:
            tape = TapeEdge.untaped
        self.tape = tape

    def cut(self):
        if self.tape == TapeEdge.taped:
            new_tape = TapeEdge.cut
        else:
            new_tape = self.tape
        
        return EdgeState(CardboardEdge.cut, new_tape)

    def apply_tape(self):
        return EdgeState(self.cardboard, TapeEdge.taped)

class Rend(IntEnum):
    closed = 0
    open = 1

class SpillageLevel(IntEnum):
    none = 0
    light = 1
    heavy = 2

class Item(metaclass=abc.ABCMeta):
    @abc.abstractmethod
    def weight(self):
        pass

    @abc.abstractmethod
    def name(self):
        pass

    @abc.abstractmethod
    def pre_gestalt(self):
        pass

    @abc.abstractmethod
    def post_gestalt(self):
        pass

    def article(self):
        return 'a'

class Weight(IntEnum):
    empty = 0
    very_light = 1
    light = 2
    medium = 3
    heavy = 4
    very_heavy = 5


