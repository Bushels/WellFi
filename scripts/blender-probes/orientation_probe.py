import bpy, math, os
from mathutils import Vector

OUTDIR = r"C:\Users\kyle\MPS\WellFi\tmp\orientation"
os.makedirs(OUTDIR, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_WORKBENCH'
scene.render.image_settings.file_format = 'PNG'
scene.render.resolution_x = 800
scene.render.resolution_y = 2400
scene.render.resolution_percentage = 100
scene.display.shading.light = 'STUDIO'
scene.display.shading.color_type = 'MATERIAL'
scene.display.shading.show_object_outline = False
scene.display.shading.show_cavity = False

bpy.ops.import_scene.gltf(filepath=r"C:\Users\kyle\MPS\WellFi\wellfi-marketing\public\models\wellfi-sideclamp.glb")
obj = next(o for o in bpy.data.objects if o.type == 'MESH')

# center mesh
bpy.context.view_layer.update()
world = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
mins = Vector((min(v.x for v in world), min(v.y for v in world), min(v.z for v in world)))
maxs = Vector((max(v.x for v in world), max(v.y for v in world), max(v.z for v in world)))
center = (mins + maxs) * 0.5
obj.location -= center
bpy.context.view_layer.update()
world = [obj.matrix_world @ Vector(corner) for corner in obj.bound_box]
mins = Vector((min(v.x for v in world), min(v.y for v in world), min(v.z for v in world)))
maxs = Vector((max(v.x for v in world), max(v.y for v in world), max(v.z for v in world)))
height = maxs.z - mins.z
width_x = maxs.x - mins.x
width_y = maxs.y - mins.y

views = [
    ('neg_x', Vector((-760, 0, 0)), width_y),
    ('pos_x', Vector((760, 0, 0)), width_y),
    ('neg_y', Vector((0, -760, 0)), width_x),
    ('pos_y', Vector((0, 760, 0)), width_x),
]

for name, location, horiz in views:
    for cam in [o for o in bpy.data.objects if o.type == 'CAMERA']:
        bpy.data.objects.remove(cam, do_unlink=True)
    cam_data = bpy.data.cameras.new(f'Cam_{name}')
    cam_data.type = 'ORTHO'
    cam_data.ortho_scale = horiz * 1.25
    cam = bpy.data.objects.new(f'Cam_{name}', cam_data)
    cam.location = location
    cam.rotation_euler = (Vector((0,0,0)) - cam.location).to_track_quat('-Z','Y').to_euler()
    bpy.context.collection.objects.link(cam)
    scene.camera = cam
    scene.render.filepath = os.path.join(OUTDIR, f'{name}.png')
    bpy.ops.render.render(write_still=True)
    print('rendered', name)
