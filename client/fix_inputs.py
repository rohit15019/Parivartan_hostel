import re

with open('src/pages/admin/StudentsList.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

def replace_input_new(match):
    prefix = match.group(1)
    field = match.group(2)
    return f'<Input name="add_{field}" id="add_{field}" {prefix} value={{newStudent.{field}}}'

def replace_input_edit(match):
    prefix = match.group(1)
    field = match.group(2)
    return f'<Input name="edit_{field}" id="edit_{field}" {prefix} value={{editingStudent.{field}}}'

content = re.sub(r'<Input (.*?)value=\{newStudent\.(\w+)\}', replace_input_new, content)
content = re.sub(r'<Input (.*?)value=\{editingStudent\.(\w+)\}', replace_input_edit, content)

content = content.replace(
    '<Input \n              placeholder="Search by name, ID, room or phone..." \n              className="pl-10"\n              value={searchTerm}',
    '<Input \n              name="search"\n              id="search"\n              placeholder="Search by name, ID, room or phone..." \n              className="pl-10"\n              value={searchTerm}'
)

content = content.replace(
    '<select \n                        required \n                        value={newStudent.room}',
    '<select \n                        name="add_room"\n                        id="add_room"\n                        required \n                        value={newStudent.room}'
)

content = content.replace(
    '<select \n                        required \n                        value={editingStudent.room}',
    '<select \n                        name="edit_room"\n                        id="edit_room"\n                        required \n                        value={editingStudent.room}'
)

with open('src/pages/admin/StudentsList.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
