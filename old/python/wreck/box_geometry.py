from collections import deque, defaultdict

from wreck.datatypes import Matrix2, Dangle

""""
Nodes
      00 01 02
      03 04 05
00 03 06 07 08 05 02
09 10 11 12 13 14 15
16 17 18 19 20 21 22
      17 23 21
      16 24 22
      09 25 15
      00 01 02

Box Faces:
    Top:
    00 01 02
    09 25 15
    16 24 22
    
    Bottom:
    20 19 18
    13 12 11
    08 07 06

    North:
    02 01 00
    05 04 03
    08 07 06

    East:
    22 15 02
    21 14 05
    20 13 08

    South:
    16 24 22
    17 23 21
    18 19 20

    West:
    00 09 16
    03 10 17
    06 11 18

Box edges
(0, 1, 2),
(0, 3, 6),
(0, 9, 16),
(2, 5, 8),
(2, 15, 22),
(6, 7, 8),
(6, 11, 18),
(8, 13, 20),
(16, 17, 18),
(16, 24, 22)
(18, 19, 20),
(20, 21, 22)

Cuttable (half-) edges
(0, 1), (0, 3), (0, 9),
(1, 2), (1, 4), (1, 25),
(2, 5), (2, 15),
(3, 4), (3, 6), (3, 10),
(4, 5), (4, 7),
(5, 8),
(6, 7), (6, 11),
(7, 8), (7, 12),
(8, 13),
(9, 10), (9, 16), (9, 25),
(10, 11), (10, 17),
(11, 12), (11, 18),
(12, 13), (12, 19),
(13, 14), (13, 20),
(14, 15), (14, 21),
(15, 22), (15, 25),
(16, 17), (16, 24),
(17, 18), (17, 23),
(18, 19),
(19, 20), (19, 23),
(20, 21),
(21, 22), (21, 23),
(22, 24),
(23, 24),
(24, 25)

"""

face_names = ['t', 'b', 'n', 'e', 's', 'w']

face_vertices = {
    't': Matrix2([
        [0,  1,  2 ],
        [9,  25, 15],
        [16, 24, 22]]),
    'b': Matrix2([
        [20, 19, 18],
        [13, 12, 11],
        [8,  7,  6 ]]),
    'n': Matrix2([
        [2,  1,  0 ],
        [5,  4,  3 ],
        [8,  7,  6 ]]),
    'e': Matrix2([
        [22, 15, 2 ],
        [21, 14, 5 ],
        [20, 13, 8 ]]),
    's': Matrix2([
        [16, 24, 22],
        [17, 23, 21],
        [18, 19, 20]]),
    'w': Matrix2([
        [0,  9,  16],
        [3,  10, 17],
        [6,  11, 18]])
}

face_quadrants = {
    't': Matrix2([
        [0,  1 ],
        [2,  3 ]]),
    'b': Matrix2([
        [4,  5 ],
        [6,  7 ]]),
    'n': Matrix2([
        [8,  9 ],
        [10, 11]]),
    'e': Matrix2([
        [12, 13],
        [14, 15]]),
    's': Matrix2([
        [16, 17],
        [18, 19]]),
    'w': Matrix2([
        [20, 21],
        [22, 23]]),
} 

def build_edge_quadrant_mappings():
    quadrant_2_edges = {}
    edge_2_quadrants = defaultdict(list)

    for f in face_names:
        vs = face_vertices[f]
        qs = face_quadrants[f]
        for x, y in [(0,0), (1,0), (0,1), (1,1)]:
            q_edges = get_quadrant_edges(vs, x, y)
            quadrant_2_edges[qs[x,y]] = q_edges
            for qe in q_edges:
                edge_2_quadrants[qe].append(qs[x,y])

    return quadrant_2_edges, edge_2_quadrants

def get_quadrant_edges(m, x, y):
    offsets = [
        (0,0,0,1),
        (0,0,1,0),
        (1,1,0,1),
        (1,1,1,0),
    ]
    edges = []
    for x1, y1, x2, y2 in offsets:
        e1, e2 = m[x+x1, y+y1], m[x+x2, y+y2]
        if e2 < e1:
            edges.append((e2, e1))
        else:
            edges.append((e1, e2))

    return edges

quadrant_2_edges, edge_2_quadrants = build_edge_quadrant_mappings()


def get_quadrant_partition(quadrant, cut_edges):
    current_partition = set([quadrant])
    horizon = deque(quadrant_2_edges[quadrant])
    while horizon:
        e = horizon.popleft()
        if e in cut_edges:
            continue
        next_qs = set(edge_2_quadrants[e])
        new_qs = next_qs - current_partition
        if new_qs:
            for q in new_qs:
                horizon.extend(quadrant_2_edges[q])
                current_partition.add(q)

    return frozenset(current_partition)

def get_partitions(cut_edges):
    quadrants = set(range(24))
    partitions = []
    while quadrants:
        q = quadrants.pop()
        partition = get_quadrant_partition(q, cut_edges)
        partitions.append(partition)
        quadrants = quadrants - partition
    
    return partitions

class FaceMesh:
    def __init__(self, vertices, quadrants):
        self.vertices = vertices
        self.quadrants = quadrants

    def rotate(self, degrees):
        return FaceMesh(self.vertices.rotate(degrees), self.quadrants.rotate(degrees))

class BoxMesh:
    def __init__(self, dimensions, faces=None, cut_edges=None):
        self.dimensions = dimensions

        if faces is None:
            faces = {f: FaceMesh(face_vertices[f], face_quadrants[f]) for f in face_names}
        self.faces = faces

        if cut_edges is None:
            cut_edges = []
        self.cut_edges = list(cut_edges)

    def copy(self):
        return BoxMesh(self.dimensions[:], self.faces.copy(), self.cut_edges[:])

    def cut(self, face, start, end):
        return self.cut_or_tape('cut', face, start, end)

    def tape(self, face, start, end):
        return self.cut_or_tape('tape', face, start, end)

    def cut_or_tape(self, operation, face, start, end):
        if operation not in ['cut', 'tape']:
            raise ValueError('operation must be "cut" or "tape". Got: '+str(operation))

        x1, y1 = start
        x2, y2 = end

        if abs(x2 - x1) + abs(y2 - y1) != 1:
            raise ValueError('start and end points of cut/tape are not adjacent: {} and {}'.format(start, end))

        f = self.faces[face].vertices
        fs = f[start]
        fe = f[end]

        if fe < fs:
            new_edge = (fe, fs)
        else:
            new_edge = (fs, fe)

        new_box = self.copy()
        
        if operation == 'cut':
            if new_edge not in new_box.cut_edges:
                new_box.cut_edges.append(new_edge)

        elif operation == 'tape':
            if new_edge in new_box.cut_edges:
                new_box.cut_edges.remove(new_edge)

        return new_box

    def get_cut_paths(self):
        #search for cycles in the cut edges that don't include taped edges
        horizon = deque(e for e in self.cut_edges)
        paths = []
        while horizon:
            p = horizon.popleft()
            
            if p[0] == p[-1]:
                paths.append(p)
                continue #skip adding to cycles
            
            dead_path = True
            for e in self.cut_edges:
                if len(p) == 2 and e == p:
                    continue #comparing an edge to its 2-length path. skip
                
                if p[-1] in e:
                    if any(x in e for x in p[1:-1]):
                        continue
                    
                    if e[0] == p[-1]:
                        new_path = p + (e[1],)
                    else: # e[1] == n
                        new_path = p + (e[0],)
                    dead_path = False
                    horizon.append(new_path)
            
            if dead_path:
                paths.append(p)

        return paths

    def get_rends(self):
        return get_partitions(self.cut_edges)

    def get_free_rends(self):
        return [r for r in self.get_rends() if not self.is_partition_fixed(r)]

    def get_partition_face_membership(self, partition):
        face_membership = {}

        for f in face_names:
            face_membership[f] = sum(q in self.faces[f].quadrants for q in partition)
        return face_membership

    def get_quadrant_face(self, quadrant):
        for f in face_names:
            if quadrant in self.faces[f].quadrants:
                return f

    def is_partition_fixed(self, partition):
        face_membership = self.get_partition_face_membership(partition)
        return face_membership['b'] > 0

    def get_dangles(self):
        rends = self.get_rends()
        fixed_rends = [rend for rend in rends if self.is_partition_fixed(rend)]

        dangles = []

        for (e1, e2) in self.get_box_edges():
            e_2_q_2_f = {e: {q: self.get_quadrant_face(q)
                             for q in edge_2_quadrants[e]}
                         for e in (e1, e2)}
            edge_dangles = []
            
            for es in [[e1, e2], [e1], [e2]]:
                new_cut_edges = self.cut_edges + es
                new_partitions = get_partitions(new_cut_edges)
                if len(new_partitions) != len(rends):
                    
                    #we've got a dangle on this edge
                    for np in new_partitions:
                        if np in rends:
                            continue
                        
                        if self.is_partition_fixed(np):
                            continue

                        if not any(np.intersection(fixed_rend) for fixed_rend in fixed_rends):
                            continue #it's a dangle on an already-free rend of cardboard
                        
                        if any(np == ed.partition for ed in edge_dangles):
                            continue

                        q_2_fs = [e_2_q_2_f[e] for e in es]
                        fixed_fs = []
                        dangle_fs = []
                        for q_2_f in q_2_fs:
                            for q, f in q_2_f.items():
                                if q in np:
                                    dangle_fs.append(f)
                                else:
                                    fixed_fs.append(f)

                        if len(set(fixed_fs)) != 1 or len(set(dangle_fs)) != 1:
                            continue #this dangle relies on a single edge, not a double, and we're in a double

                        edge_dangles.append(Dangle(
                            partition=np,
                            edges=tuple(es),
                            fixed_face=fixed_fs[0],
                            free_face=dangle_fs[0]))
            
            dangles.extend(edge_dangles)

        dangles.sort(key=lambda x:len(x.partition))
        final_dangles = []

        for i in range(len(dangles)):
            p = dangles[i].partition
            if not any(p < d.partition for d in dangles[i+1:]):
                final_dangles.append(dangles[i])
        
        return final_dangles

    def get_box_edges(self):
        edges = []
        t_b_edge_coords = [
            [(0,0), (0,1), (0,2)],
            [(0,0), (1,0), (2,0)],
            [(2,0), (2,1), (2,2)],
            [(0,2), (1,2), (2,2)]
        ]

        for f in ['t', 'b']:
            m = self.faces[f].vertices
            
            for p1, p2, p3 in t_b_edge_coords:
                edge = []
                v1 = m[p1]
                v2 = m[p2]
                v3 = m[p3]

                if v2 < v1:
                    edge.append((v2, v1))
                else:
                    edge.append((v1, v2))

                if v3 < v2:
                    edge.append((v3, v2))
                else:
                    edge.append((v2, v3))

                edges.append(edge)

        for f in ['n', 'e', 's', 'w']:
            m = self.faces[f].vertices

            edge = []
            v1 = m[0,0]
            v2 = m[0,1]
            v3 = m[0,2]

            if v2 < v1:
                edge.append((v2, v1))
            else:
                edge.append((v1, v2))

            if v3 < v2:
                edge.append((v3, v2))
            else:
                edge.append((v2, v3))

            edges.append(edge)

        return edges

    def rotate_y(self, degrees):
        if degrees not in [0, 90, 180, 270, 360]:
            raise ValueError('Invalid number of degrees')

        if degrees == 0 or degrees == 360:
            return self

        new_faces = rotate_y_faces(self.faces, degrees)

        if degrees == 180:
            return BoxMesh(self.dimensions, new_faces, self.cut_edges)
        else:
            x, y, z = self.dimensions
            return BoxMesh((z, y, x), new_faces, self.cut_edges)

    def roll(self, direction):
        if direction not in ['n', 's', 'e', 'w']:
            raise ValueError('Invalid roll direction')
        
        x, y, z = self.dimensions
        if direction == 'n' or direction == 's':
            new_x, new_y, new_z = x, z, y
        else: #if direction == 'e' or direction == 'w':
            new_x, new_y, new_z = y, x, z

        new_faces = roll_faces(self.faces, direction)

        return BoxMesh((new_x, new_y, new_z), new_faces, self.cut_edges)

    def description(self):
        face_descr = {
            't': 'top',
            'b': 'bottom',
            'n': 'back',
            'e': 'right',
            's': 'front',
            'w': 'left'
        }

        x, y, z = self.dimensions
        result = "The box's dimensions measure {} by {} by {}.".format(x, y, z)

        rends = self.get_free_rends()
        
        for fr in rends:
            face_membership = self.get_partition_face_membership(fr)
            faces = []
            for f in face_names:
                if face_membership[f] > 0:
                    faces.append(f)

            if len(faces) == 1:
                faces_text = face_descr[faces[0]] + ' face'
            else:
                faces_text = ', '.join(face_descr[f] for f in faces[:-1]) + ' and {} faces'.format(face_descr[faces[-1]])

            result += "\nA portion of the box's {} has been rended free; it lies on the floor off to the side.".format(faces_text)

        dangles = self.get_dangles()
       
        for d in dangles:
            face_membership = self.get_partition_face_membership(d.partition)
            faces = []
            for f in face_names:
                if face_membership[f] > 0:
                    faces.append(f)

            if len(faces) == 1:
                faces_text = face_descr[faces[0]] + ' face'
            else:
                faces_text = ', '.join(face_descr[f] for f in faces[:-1]) + ' and {} faces'.format(face_descr[faces[-1]])

            result += "\nA portion of the box's {} sits on a free hinge; from the {} face it can be swung to the {}.".format(
                faces_text, face_descr[d.free_face], face_descr[d.fixed_face])

        return result


def rotate_y_faces(faces, degrees):
    if degrees not in [0, 90, 180, 270, 360]:
        raise ValueError('Invalid number of degrees')

    if degrees == 0 or degrees == 360:
        return faces

    shift = degrees // 90
    face_cycle = ['n', 'w', 's', 'e'] * 2

    new_faces = {}
    for direction in ['n', 'e', 's', 'w']:
        new_faces[direction] = faces[face_cycle[face_cycle.index(direction) + shift]]

    new_faces['t'] = faces['t'].rotate(degrees)
    new_faces['b'] = faces['b'].rotate(degrees)

    return new_faces

def roll_faces(faces, direction):
    if direction not in ['n', 's', 'e', 'w']:
        raise ValueError('Invalid roll direction')
    
    new_faces = {}
    if direction == 'n':
        new_faces['n'] = faces['t'].rotate(180)
        new_faces['t'] = faces['s']
        new_faces['s'] = faces['b']
        new_faces['b'] = faces['n'].rotate(180)

        new_faces['e'] = faces['e'].rotate(90)
        new_faces['w'] = faces['w'].rotate(270)

    elif direction == 's':
        new_faces['s'] = faces['t']
        new_faces['t'] = faces['n'].rotate(180)
        new_faces['n'] = faces['b']
        new_faces['b'] = faces['s'].rotate(180)

        new_faces['e'] = faces['e'].rotate(270)
        new_faces['w'] = faces['w'].rotate(90)

    elif direction == 'e':
        new_faces['e'] = faces['t'].rotate(90)
        new_faces['t'] = faces['w'].rotate(90)
        new_faces['w'] = faces['b'].rotate(270)
        new_faces['b'] = faces['e'].rotate(270)
        
        new_faces['n'] = faces['n'].rotate(270)
        new_faces['s'] = faces['s'].rotate(90)

    elif direction == 'w':
        new_faces['w'] = faces['t'].rotate(270)
        new_faces['t'] = faces['e'].rotate(270)
        new_faces['e'] = faces['b'].rotate(90)
        new_faces['b'] = faces['w'].rotate(90)

        new_faces['n'] = faces['n'].rotate(90)
        new_faces['s'] = faces['s'].rotate(270)

    return new_faces


if __name__ == '__main__':
    bm = BoxMesh((2,3,4))
    bm2 = bm.cut('t', (0,0), (1,0)).cut('t', (1,0), (1,1)).cut('t', (1,1), (0,1)).cut('t', (0,1), (0,0))
    bm3 = bm2.cut('t', (0,1), (0,2)).cut('s', (0, 0), (0, 1)).cut('s', (0,1), (1,1)).cut('s', (1,1), (1,0)).cut('t', (1, 2), (1,1))

    bm4 = bm.cut('t', (0,0), (1,0)).roll('s').cut('t', (0,2), (0,1)).cut('t', (0,1), (1,1)).cut('t', (1,1), (1,2))

    bm5 = bm.cut('n', (0,0), (1,0)).cut('n', (1,0), (2,0)).cut('n', (2,0), (2,1)).cut('n', (2,1), (1,1)).cut('n', (1,1), (0,1)).cut('n', (1,1), (1, 0)).cut('n', (0,1), (0,0))

    bm6 = bm.cut('t', (0,0), (0,1)).cut('t', (0,1), (1,1)).cut('t', (1,1), (1,0))
    bm7 = bm2.cut('t', (0,1), (0,2)).cut('t', (1,1), (1,2))

    bm8 = (bm.cut('t', (0,0), (1,0)).cut('t', (1,0), (2,0)).cut('t', (2,0), (2,1)).cut('t', (2,1), (2,2))
             .cut('t', (0,2), (0,1)).cut('t', (0,1), (1,1)).cut('t', (1,1), (1,2))
             .cut('s', (1,0), (1,1)).cut('s', (1,1), (0,1))
             .cut('w', (0,0), (0,1)).cut('w', (0,1), (1,1)).cut('w', (1,1), (2,1)))

    for i, b in enumerate([bm, bm2, bm3, bm4, bm5, bm6, bm7, bm8]):
        print('Box #', i+1)
        print()
        print(b.description())
        print()
        print()

