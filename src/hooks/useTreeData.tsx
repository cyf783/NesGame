import { Message, Modal, Input, InputSearch } from "@arco-design/web-vue";
import { ITreeItem } from "@/types";
import { $emit } from "@/hooks/useEventBus";
import { REMOVE_FEATURE } from "@/common/symbol";
import { createKey, findParent } from "@/utils/tree";
import { useTreeStore } from "@/store";
import { showGameFileOpenDialog } from "@/utils";

const treeStore = useTreeStore();

export function useTreeData() {
  function preCheck() {
    if (!treeStore.selected) {
      Message.error("请先选择一个游戏或分类");
      return false;
    }
    return true;
  }

  /**
   * 添加文件到当前分类
   */
  function addFile(root: boolean = false) {
    const res = preCheck();
    let title = ref("");
    let path = ref("");
    let ext = ref("");
    const InputInstance = h("div", [
      h("span", "游戏名"),
      h(Input, {
        //@ts-ignore
        defaultValue: title,
        placeholder: "请输入游戏名...",
        onInput: (v: string) => {
          title.value = v;
        },
      }),
      h("span", "游戏地址"),
      h(InputSearch, {
        defaultValue: path,
        placeholder: "请输入网络地址或选择本地文件...",
        buttonText: "选择文件",
        searchButton: true,
        onInput: (v: string) => {
          path.value = v;
        },
        onSearch: (value: string, ev: MouseEvent) => {
          const tmp = showGameFileOpenDialog();
          if(tmp) {
            path.value = tmp[0];
            const p = path.value.split(".")
            ext.value = p[p.length-1]
          } 

        },
      }),
      h("span", "游戏文件扩展名"),
      h(Input, {
        //@ts-ignore
        defaultValue: ext,
        placeholder: "请输入游戏文件扩展名...",
        onInput: (v: string) => {
          ext.value = v;
        },
      }),
    ]);
    Modal.confirm({
      title: `添加游戏`,
      cancelText: "取消",
      content: () => InputInstance,
      onBeforeOk: (done) => {
        if (!title.value) {
          Message.error("游戏名不能为空");
          done(false);
          return;
        }

        if (title.value.length > 100) {
          Message.error("游戏名过长");
          done(false);
          return;
        }
        if (!path) {
          Message.error("游戏地址不能为空");
          done(false);
          return;
        }
        if (!ext.value) {
          Message.error("游戏文件扩展名不能为空");
          done(false);
          return;
        }
        let iFileItem: ITreeItem = {
          title: title.value,
          key: createKey(path.value),
          path: path.value,
          ext: ext.value,
        };
        if (treeStore.hasKey(iFileItem.key)) {
          Message.error("游戏地址已存在，不需要重复添加");
          done(false);
          return;
        }
        if (root || !res) {
          treeStore.data.push(iFileItem);
          // 选中新创建的文件
          treeStore.selected = treeStore.data[treeStore.data.length - 1];
        } else if (treeStore.selected?.children) {
          treeStore.selected.children.push(iFileItem);
          // 选中新创建的文件
          treeStore.selected =
            treeStore.selected.children[treeStore.selected.children.length - 1];
        } else {
          const parent = findParent(treeStore.selected!.key, treeStore.data);
          if (parent.length) {
            parent[0].children?.push(iFileItem);
            // 选中新创建的文件
            treeStore.selected =
              parent[0].children![parent[0].children!.length - 1];
          }
        }
        Message.success("添加成功");
        done(true);
      },
    });
  }

  /**
   * 添加分类到当前分类
   */
  function addFolder(root: boolean = false) {
    const res = preCheck();
    let title = "";
    const InputInstance = h("div", [
      h(Input, {
        defaultValue: title,
        placeholder: "请输入分类名...",
        onInput: (v: string) => {
          title = v;
        },
      }),
    ]);

    Modal.confirm({
      title: `添加分类`,
      cancelText: "取消",
      content: () => InputInstance,
      onBeforeOk: (done) => {
        if (!title) {
          Message.error("分类名不能为空");
          done(false);
          return;
        }

        if (title.length > 100) {
          Message.error("分类名过长");
          done(false);
          return;
        }
        let iFileItem: ITreeItem = {
          title: title,
          key: createKey(title, new Date().getTime() + ""),
          children: [],
        };
        if (root || !res) {
          treeStore.data.push(iFileItem);
          // 选中新创建的文件
          treeStore.selected = treeStore.data[treeStore.data.length - 1];
        } else if (treeStore.selected?.children) {
          treeStore.selected.children.push(iFileItem);
          // 选中新创建的文件
          treeStore.selected =
            treeStore.selected.children[treeStore.selected.children.length - 1];
        } else {
          const parent = findParent(treeStore.selected!.key, treeStore.data);
          if (parent.length) {
            parent[0].children?.push(iFileItem);
            // 选中新创建的文件
            treeStore.selected =
              parent[0].children![parent[0].children!.length - 1];
          }
        }
        Message.success("添加成功");
        done(true);
      },
    });
  }

  /**
   * 删除当前文件或分类
   */
  function handleDelete() {
    const res = preCheck();
    if (!res) return;
    const node = treeStore.selected!;
    // 如果当前节点是分类 检查分类中是否有文件
    // 有文件则提示用户是否删除 无文件则直接删除
    if (node?.children) {
      // 检查当前分类是否为根节点 且只有一个分类
      if (
        !findParent(node.key, treeStore.data).length &&
        treeStore.data.length === 1
      ) {
        Message.error("根分类下至少要有一个分类");
        return;
      }

      // 根节点 且有多个分类 允许删除
      if (
        !findParent(node.key, treeStore.data).length &&
        treeStore.data.length > 1
      ) {
        // 根节点下有内容 询问用户是否删除
        if (node.children.length) {
          Modal.warning({
            title: "当前分类中有文件，是否删除？",
            content: "删除后无法恢复",
            hideCancel: false,
            cancelText: "取消",
            onOk() {
              // 删除当前分类下的所有文件
              const index = treeStore.data.findIndex(
                (item: ITreeItem) => item.key === node.key
              );
              if (index !== undefined) {
                treeStore.data.splice(index, 1);
                $emit(
                  REMOVE_FEATURE,
                  node.children!.map((item: ITreeItem) => item.key)
                );
                Message.success("删除成功");
              }
            },
          });
          return;
        } else {
          // 当前分类中没有内容 直接删除
          const index = treeStore.data.findIndex(
            (item: ITreeItem) => item.key === node.key
          );
          if (index !== undefined) {
            treeStore.data.splice(index, 1);
            Message.success("删除成功");
          }
          return;
        }
      }

      if (node.children.length) {
        // 当前分类中有内容(文件或分类)
        Modal.warning({
          title: "当前分类中有内容，是否删除？",
          content: "删除后无法恢复",
          hideCancel: false,
          cancelText: "取消",
          onOk() {
            // 删除当前分类下的所有文件
            // 递归收集所有被文件的key
            const keys: string[] = [];

            function collectKeys(node: ITreeItem) {
              if (node.children) {
                node.children.forEach((item) => {
                  collectKeys(item);
                });
              } else {
                keys.push(node.key);
              }
            }
            collectKeys(node);
            // 删除当前分类
            const parent = findParent(node.key, treeStore.data);
            if (parent.length) {
              const index = parent[0].children?.findIndex(
                (item) => item.key === node.key
              );
              if (index !== undefined) {
                parent[0].children?.splice(index, 1);
                $emit(REMOVE_FEATURE, keys);
                Message.success("删除成功");
              }
            }
          },
        });
      } else {
        // 空分类 直接删除
        const parent = findParent(node.key, treeStore.data);
        // 有父节点 则找到当前节点并删除
        if (parent.length) {
          const index = parent[0].children?.findIndex(
            (item) => item.key === node.key
          );
          if (index !== undefined) {
            parent[0].children?.splice(index, 1);
            $emit(
              REMOVE_FEATURE,
              node.children!.map((item: ITreeItem) => item.key)
            );
            Message.success("删除成功");
          }
        }
      }
    } else {
      // 当前节点是文件
      Modal.warning({
        title: "是否删除当前文件？",
        content: "删除后无法恢复",
        hideCancel: false,
        cancelText: "取消",
        onOk() {
          // 删除当前节点
          const parent = findParent(node.key, treeStore.data);
          const ls =
            parent && parent.length ? parent[0].children : treeStore.data;
          const index = ls?.findIndex((item) => item.key === node.key);
          if (index !== undefined) {
            ls?.splice(index, 1);

            // 检查后一个节点是否存在
            if (index + 1 <= ls!.length && !ls![index].children) {
              // 存在则选中后一个节点
              treeStore.selected = ls![index];
            }
            // 检查前一个节点是否存在
            else if (index - 1 >= 0 && !ls![index - 1].children) {
              // 存在则选中前一个节点
              treeStore.selected = ls![index - 1];
            }

            $emit(REMOVE_FEATURE, node.key);
            Message.success("删除成功");
          }
        },
      });
    }
  }

  /**
   * 重命名当前文件或分类
   */
  function handleRename() {
    const res = preCheck();
    if (!res) return;

    const node = treeStore.selected!;
    let title = treeStore.selected!.title;

    const InputInstance = (
      <Input
        defaultValue={title}
        onInput={(value: string) => (title = value)}
      ></Input>
    );

    Modal.confirm({
      title: `重命名${node.children ? "分类" : "游戏"}：【${node.title}】`,
      cancelText: "取消",
      content: () => InputInstance,
      onBeforeOk: (done) => {
        if (!title) {
          Message.error("标题不能为空");
          done(false);
          return;
        }

        if (title.length > 100) {
          Message.error("标题过长");
          done(false);
          return;
        }

        // 标题未改变
        if (title === node.title) {
          Message.info("标题没有修改");
          done(true);
          return;
        }

        node.title = title;

        Message.success("重命名成功");
        done(true);
      },
      onOpen() {
        // 打开弹窗后自动聚焦并全选
        InputInstance?.el?.querySelector("input").select();
        // @ts-ignore
        InputInstance.component?.ctx?.focus();
      },
    });
  }

  return {
    addFile,
    addFolder,
    handleDelete,
    handleRename,
  };
}
