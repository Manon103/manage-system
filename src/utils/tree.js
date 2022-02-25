import { Store } from "vuex";

export function initDeptTree(data) {
  const treeData = [];
  // 将数据处理成为树结构
  const root = data.find((item) => item.parentId === 0);
  if (root) {
    root._showChildren = true;
    root.label = root.deptName;
    root.value = root.deptId;
    treeData.push(root);
    const firstLevelNodes = data.filter(
      (item) => item.parentId === root.deptId
    );
    treeData[0].children = firstLevelNodes.map((item) => {
      return {
        ...item,
        _showChildren: true,  // 默认展开
        label: item.deptName,
        value: item.deptId,
      };
    });
    data.forEach((dept, index) => {
      const firstLevelIds = firstLevelNodes.map((item) => item.deptId);
      if (!firstLevelIds.includes(dept.deptId)) {
        const findReuslt = findParent(treeData, dept);
        if (!findReuslt) {
          data.splice(index, 1);
          data.push(dept);
        }
      }
    });
  }
  return treeData;
}

function findParent(list, dept) {
  if (!dept.parentId) {
    return;
  }
  let result = false;
  const children = list[0].children;
  function recrusionChildren(children) {
    for (let item of children) {
      if (item.deptId === dept.parentId) {
        dept.label = dept.deptName;
        dept.value = dept.deptId;
        item.children.push(dept);
        result = true;
        break;
      }
      recrusionChildren(item.children);
    }
  }
  recrusionChildren(children);
  return result;
}

export function getAllParent(data, type, flatData) {
  let dept = data;
  const superiorDeptId = type === 'create' ? [data.deptId] : [];
  while (dept.parentId) {
    superiorDeptId.push(dept.parentId);
    dept = flatData.find(item => item.deptId === dept.parentId);
  }
  return superiorDeptId.reverse();
}