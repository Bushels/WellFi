import bpy, os, math
from mathutils import Vector

OUTDIR = r"C:\Users\kyle\MPS\WellFi\tmp\yaw_probe"
os.makedirs(OUTDIR, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_WORKBENCH'
scene.render.image_settings.file_format = 'PNG'
scene.render.resolution_x = 420
scene.render.resolution_y = 1260
scene.render.resolution_percentage = 100
scene.display.shading.light = 'STUDIO'
scene.display.shading.color_type = 'MATERIAL'
scene.display.shading.show_object_outline = False
scene.display.shading.show_cavity = False

bpy.ops.import_scene.gltf(filepath=r"C:\Users\kyle\MPS\WellFi\wellfi-marketing\public\models\wellfi-sideclamp.glb")
obj = next(o for o in bpy.data.objects if o.type == 'MESH')

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
max_width = max(maxs.x - mins.x, maxs.y - mins.y)

cam_data = bpy.data.cameras.new('Cam')
cam_data.type = 'ORTHO'
cam_data.ortho_scale = max_width * 1.5
cam = bpy.data.objects.new('Cam', cam_data)
bpy.context.collection.objects.link(cam)
scene.camera = cam

angles = [-55, -45, -35, -25, -15, 15, 25, 35, 45, 55, 125, 145, 215, 235]
radius = 760

for angle in angles:
    rad = math.radians(angle)
    cam.location = Vector((math.cos(rad) * radius, math.sin(rad) * radius, 0.0))
    cam.rotation_euler = (Vector((0,0,0)) - cam.location).to_track_quat('-Z','Y').to_euler()
    path = os.path.join(OUTDIR, f'{angle:+03d}.png')
    scene.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print('rendered', angle, path)
