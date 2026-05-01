import bpy
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=r"C:\Users\kyle\MPS\WellFi\wellfi-marketing\public\models\wellfi-sideclamp.glb")
for obj in bpy.data.objects:
    if obj.type != 'MESH':
        continue
    print('OBJ', obj.name)
    mats = []
    for slot in obj.material_slots:
        mat = slot.material
        if mat is None:
            continue
        color = None
        if hasattr(mat, 'node_tree') and mat.node_tree:
            bsdf = next((n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None)
            if bsdf:
                color = tuple(round(v,3) for v in bsdf.inputs['Base Color'].default_value[:3])
        mats.append((mat.name, color))
    print('MATERIALS', mats)
