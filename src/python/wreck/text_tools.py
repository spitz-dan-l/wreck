def face_message(face_order, f_code_2_name=None):
    if f_code_2_name is None:
        f_code_2_name = {
            'n': 'back',
            's': 'front',
            'e': 'right',
            'w': 'left',
            't': 'top',
            'b': 'bottom'
        }

    if len(face_order) == 1:
        face_msg = '{} face'.format(f_code_2_name[face_order[0]])
    else:
        face_msg = ', '.join(map(f_code_2_name.get, face_order[:-1])) + ' and {} faces'.format(f_code_2_name[face_order[-1]])

    return face_msg


def uncapitalize(msg):
    return msg[0].lower() + msg[1:]