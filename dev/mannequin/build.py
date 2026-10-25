"""Builds the app's anatomical mannequin from MakeHuman's CC0 assets.

Usage: python3 -I dev/mannequin/build.py <makehuman/data dir> <out dir>

Reads base.obj, the macro targets, the default skeleton and its weights;
applies an athletic young male shape; keeps the body, eyes (to fill the
sockets) and the tights helper trimmed into shorts; merges the face, finger
and toe bones into a 38-bone skeleton; and writes mannequin.bin + mannequin.json.
"""
import json
import os
import struct
import sys

DATA, OUT = sys.argv[1], sys.argv[2]
SCALE = 10.0  # MakeHuman decimetres -> centimetres
MUSCLE = 0.8  # 0 = average muscle, 1 = max muscle

# ---------- mesh ----------
verts, groups, faces = [], [], []
group = None
with open(os.path.join(DATA, '3dobjs/base.obj')) as f:
    for line in f:
        if line.startswith('v '):
            verts.append([float(x) for x in line.split()[1:4]])
        elif line.startswith('g '):
            group = line.split()[1]
        elif line.startswith('f '):
            idx = [int(p.split('/')[0]) - 1 for p in line.split()[1:]]
            faces.append((group, idx))


def load_target(name):
    out = {}
    with open(os.path.join(DATA, 'targets', name)) as f:
        for line in f:
            if not line.strip() or line.startswith('#'):
                continue
            p = line.split()
            out[int(p[0])] = (float(p[1]), float(p[2]), float(p[3]))
    return out


def apply(target, w):
    for i, d in target.items():
        verts[i][0] += d[0] * w
        verts[i][1] += d[1] * w
        verts[i][2] += d[2] * w


for race in ('african', 'asian', 'caucasian'):
    apply(load_target(f'macrodetails/{race}-male-young.target'), 1 / 3)
apply(load_target('macrodetails/universal-male-young-maxmuscle-averageweight.target'), MUSCLE)
apply(load_target('macrodetails/universal-male-young-averagemuscle-averageweight.target'), 1 - MUSCLE)

# ---------- skeleton ----------
skel = json.load(open(os.path.join(DATA, 'rigs/default.mhskel')))
joints = skel['joints']


def joint_pos(name):
    ids = joints[name]
    n = len(ids)
    return [sum(verts[i][k] for i in ids) / n * SCALE for k in range(3)]


KEEP = [
    'root', 'spine05', 'spine04', 'spine03', 'spine02', 'spine01', 'neck01', 'neck02', 'neck03', 'head',
    'clavicle.L', 'shoulder01.L', 'upperarm01.L', 'upperarm02.L', 'lowerarm01.L', 'lowerarm02.L', 'wrist.L',
    'clavicle.R', 'shoulder01.R', 'upperarm01.R', 'upperarm02.R', 'lowerarm01.R', 'lowerarm02.R', 'wrist.R',
    'pelvis.L', 'upperleg01.L', 'upperleg02.L', 'lowerleg01.L', 'lowerleg02.L', 'foot.L',
    'pelvis.R', 'upperleg01.R', 'upperleg02.R', 'lowerleg01.R', 'lowerleg02.R', 'foot.R',
]
bones = skel['bones']


def kept_ancestor(name):
    while name and name not in KEEP:
        name = bones[name]['parent']
    return name or 'root'


out_bones = []
for name in KEEP:
    b = bones[name]
    parent = kept_ancestor(b['parent']) if b['parent'] else None
    out_bones.append({
        'name': name,
        'parent': KEEP.index(parent) if parent else -1,
        'head': [round(v, 3) for v in joint_pos(b['head'])],
        'tail': [round(v, 3) for v in joint_pos(b['tail'])],
    })

# ---------- weights: merge dropped bones into their kept ancestor ----------
weights = json.load(open(os.path.join(DATA, 'rigs/default_weights.mhw')))['weights']
per_vert = {}
for bname, pairs in weights.items():
    target = KEEP.index(kept_ancestor(bname))
    for vi, w in pairs:
        d = per_vert.setdefault(vi, {})
        d[target] = d.get(target, 0.0) + w

# ---------- faces to keep ----------
KEEP_GROUPS = {'body', 'helper-l-eye', 'helper-r-eye'}
body_tris, shorts_tris = [], []


def tris(idx):
    return [(idx[0], idx[1], idx[2])] + ([(idx[0], idx[2], idx[3])] if len(idx) == 4 else [])


# Shorts: the tights helper, clipped exactly at a straight waistband and at hems
# square to each thigh, so the edges read as tailored rather than stepped.
HEM = 0.55  # fraction of the thigh, hip to knee
waist_y = joint_pos('spine04____head')[1] - 2.0
legs = {}
for side in ('L', 'R'):
    hip = joint_pos(f'upperleg01.{side}____head')
    knee = joint_pos(f'lowerleg01.{side}____head')
    axis = [knee[k] - hip[k] for k in range(3)]
    length = sum(a * a for a in axis) ** 0.5
    legs[side] = (hip, [a / length for a in axis], length)


def inside(i):
    """Signed distance (cm) into the shorts: positive above the hems and below the waist."""
    v = [c * SCALE for c in verts[i]]
    hip, axis, length = legs['L' if v[0] >= 0 else 'R']
    along = sum((v[k] - hip[k]) * axis[k] for k in range(3))
    return min(waist_y - v[1], HEM * length - along)


def split(a, b, t):
    """New vertex on edge a-b at t, with blended position and weights."""
    verts.append([verts[a][k] + (verts[b][k] - verts[a][k]) * t for k in range(3)])
    w = {}
    for src, f in ((a, 1 - t), (b, t)):
        for bone, x in per_vert.get(src, {0: 1.0}).items():
            w[bone] = w.get(bone, 0.0) + x * f
    per_vert[len(verts) - 1] = w
    return len(verts) - 1


def clip(poly):
    out = []
    d = [inside(i) for i in poly]
    for k in range(len(poly)):
        a, b = poly[k], poly[(k + 1) % len(poly)]
        da, db = d[k], d[(k + 1) % len(poly)]
        if da >= 0:
            out.append(a)
        if (da >= 0) != (db >= 0):
            out.append(split(a, b, da / (da - db)))
    return out


for g, idx in faces:
    if g in KEEP_GROUPS:
        body_tris += tris(idx)
    elif g == 'helper-tights':
        poly = clip(idx)
        for k in range(1, len(poly) - 1):
            shorts_tris.append((poly[0], poly[k], poly[k + 1]))

used = sorted({i for t in body_tris + shorts_tris for i in t})
remap = {v: k for k, v in enumerate(used)}

pos = []
skin_i, skin_w = [], []
for vi in used:
    pos += [v * SCALE for v in verts[vi]]
    ws = sorted(per_vert.get(vi, {0: 1.0}).items(), key=lambda kv: -kv[1])[:4]
    total = sum(w for _, w in ws) or 1.0
    q = [round(w / total * 255) for _, w in ws]
    q[0] += 255 - sum(q)
    while len(ws) < 4:
        ws.append((0, 0.0))
        q.append(0)
    skin_i += [b for b, _ in ws]
    skin_w += q

body_idx = [remap[i] for t in body_tris for i in t]
shorts_idx = [remap[i] for t in shorts_tris for i in t]

os.makedirs(OUT, exist_ok=True)
with open(os.path.join(OUT, 'mannequin.bin'), 'wb') as f:
    f.write(struct.pack(f'<{len(pos)}f', *pos))
    f.write(struct.pack(f'<{len(skin_i)}B', *skin_i))
    f.write(struct.pack(f'<{len(skin_w)}B', *skin_w))
    f.write(struct.pack(f'<{len(body_idx)}H', *body_idx))
    f.write(struct.pack(f'<{len(shorts_idx)}H', *shorts_idx))

meta = {
    'source': 'MakeHuman 1.x base mesh, default skeleton and weights (CC0 1.0), shaped as an athletic young male',
    'vertices': len(used),
    'bodyIndices': len(body_idx),
    'shortsIndices': len(shorts_idx),
    'bones': out_bones,
}
json.dump(meta, open(os.path.join(OUT, 'mannequin.json'), 'w'), separators=(',', ':'))
print(len(used), 'verts', len(body_idx) // 3, 'body tris', len(shorts_idx) // 3, 'shorts tris', len(out_bones), 'bones')
ys = [pos[i + 1] for i in range(0, len(pos), 3)]
zs = [pos[i + 2] for i in range(0, len(pos), 3)]
print('height', round(min(ys), 1), round(max(ys), 1), 'z', round(min(zs), 1), round(max(zs), 1))
