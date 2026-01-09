"use client";

import dynamic from "next/dynamic";
import type { ExtendedRecordMap } from "notion-types";
import type { Template, TemplateBlock } from "@/lib/types";
import { Button, Card, Separator } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useToast } from "./Toasts";
import { useMemo } from "react";
import { useTheme } from "next-themes";
import { Copy, Download, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

const NotionRenderer = dynamic(
  async () => (await import("react-notion-x")).NotionRenderer,
  { ssr: false }
);

function blockToNotionType(block: TemplateBlock): string {
  switch (block.type) {
    case "heading":
      return "header";
    case "paragraph":
      return "text";
    case "database":
      return "callout";
    case "table":
      return "callout";
    case "divider":
      return "divider";
    case "image":
      return "image";
    case "quote":
      return "quote";
    case "code":
      return "code";
    default:
      return "text";
  }
}

function buildRecordMap(template: Template): ExtendedRecordMap {
  const pageId = template.id;
  const now = Date.now();

  const contentIds = template.blocks.map((b) => b.id);

  const block: Record<string, any> = {
    [pageId]: {
      value: {
        id: pageId,
        version: 1,
        type: "page",
        properties: {
          title: [[template.title]],
        },
        content: contentIds,
        created_time: now,
        last_edited_time: now,
        parent_id: pageId,
        parent_table: "space",
        alive: true,
      },
    },
  };

  for (const b of template.blocks) {
    const type = blockToNotionType(b);

    if (type === "callout") {
      const calloutText =
        b.type === "database"
          ? `Database: ${b.content}`
          : `Table: ${b.content}`;
      block[b.id] = {
        value: {
          id: b.id,
          version: 1,
          type: "callout",
          parent_id: pageId,
          parent_table: "block",
          alive: true,
          created_time: now,
          last_edited_time: now,
          format: {
            block_color: "gray_background",
          },
          properties: {
            title: [[calloutText]],
          },
        },
      };
      continue;
    }

    block[b.id] = {
      value: {
        id: b.id,
        version: 1,
        type,
        parent_id: pageId,
        parent_table: "block",
        alive: true,
        created_time: now,
        last_edited_time: now,
        properties: {
          title: [[b.content]],
        },
      },
    };
  }

  return { block } as ExtendedRecordMap;
}

export function TemplatePreview({ template }: { template: Template }) {
  const router = useRouter();
  const toast = useToast();
  const { resolvedTheme } = useTheme();

  const recordMap = useMemo(() => buildRecordMap(template), [template]);

  const shareLink = useMemo(() => {
    if (template.sharedUrl) return template.sharedUrl;
    if (typeof window === "undefined") return `/preview/${template.id}`;
    return `${window.location.origin}/preview/${template.id}`;
  }, [template.id, template.sharedUrl]);

  const exportJson = () => {
    try {
      const blob = new Blob([JSON.stringify(template, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${template.title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Downloaded JSON");
    } catch {
      toast.error("Failed to export JSON");
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Share link copied");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full"
    >
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <Card className="w-full lg:w-[320px]">
          <div className="p-5">
            <h2 className="text-lg font-semibold text-slate-100">
              {template.title}
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              {template.description}
            </p>

            <Separator className="my-4" />

            <div className="space-y-2">
              <Button
                variant="tertiary"
                onPress={() => router.push("/dashboard")}
                aria-label="Back to Dashboard"
                className="w-full"
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>

              <Button
                variant="secondary"
                onPress={exportJson}
                aria-label="Export JSON"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>

              <Button
                variant="secondary"
                onPress={copyShareLink}
                aria-label="Copy share link"
                className="w-full"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy share link
              </Button>
            </div>

            <Separator className="my-4" />

            <div className="text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>Theme</span>
                <span className="capitalize">{template.theme}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span>Blocks</span>
                <span>{template.blocks.length}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Preview */}
        <Card className="w-full flex-1">
          <div className="p-5">
            <NotionRenderer
              recordMap={recordMap}
              fullPage={false}
              darkMode={resolvedTheme !== "light"}
              className="notion"
            />

            {/* Block details */}
            <Separator className="my-6" />
            <h3 className="text-sm font-semibold text-slate-200">
              Block properties
            </h3>
            <div className="mt-3 space-y-3">
              {template.blocks.map((b) => (
                <div
                  key={b.id}
                  className="rounded-lg border border-slate-700 bg-slate-900/40 p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-100">
                      <span className="capitalize">{b.type}</span>: {b.content}
                    </p>
                  </div>
                  {b.properties && (
                    <pre className="mt-2 overflow-x-auto text-xs text-slate-300">
                      {JSON.stringify(b.properties, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
