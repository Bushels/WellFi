import bpy
from mathutils import Vector

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=r"C:\Users\kyle\MPS\WellFi\wellfi-marketing\public\models\wellfi-sideclamp.glb")
meshes = [obj for obj in bpy.data.objects if obj.type == 'MESH']
print('MESH_COUNT', len(meshes))
for obj in meshes:
    print('OBJ', obj.name, 'LOC', tuple(round(v, 3) for v in obj.location), 'ROT', tuple(round(v, 3) for v in obj.rotation_euler), 'SCALE', tuple(round(v, 3) for v in obj.scale))
    world = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
    mins = tuple(round(min(v[i] for v in world), 3) for i in range(3))
    maxs = tuple(round(max(v[i] for v in world), 3) for i in range(3))
    print('BOUNDS', mins, maxs)
