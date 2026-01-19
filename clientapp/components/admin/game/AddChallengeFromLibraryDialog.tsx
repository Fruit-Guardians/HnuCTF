import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from 'components/ui/dialog';
import { Input } from 'components/ui/input';
import { ArrowLeft, ArrowRight, ArrowUpDown, CirclePlus, Loader2 } from 'lucide-react';
import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'components/ui/table';
import dayjs from 'dayjs';
import { toast } from 'react-toastify/unstyled';
import { api } from 'utils/ApiHelper';
import { ChallengeCategory, UserSimpleGameChallenge } from 'utils/A1API';
import { Button } from 'components/ui/button';
import { Checkbox } from 'components/ui/checkbox';
import { ColumnDef, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { ChallengeSolveStatus } from 'components/user/game/ChallengesView';

export default function AddChallengeFromLibraryDialog(
    { setChallenges, gameID, isOpen, setIsOpen, setChallengeSolveStatusList }: {
        setChallenges: Dispatch<SetStateAction<Record<string, UserSimpleGameChallenge[]>>>,
        gameID: number,
        isOpen: boolean,
        setIsOpen: Dispatch<SetStateAction<boolean>>,
        setChallengeSolveStatusList: Dispatch<SetStateAction<Record<string, ChallengeSolveStatus>>>,
    }
) {

    type ChallengeSearchResult = {
        ChallengeID: number,
        Category: string,
        Name: string,
        CreateTime: string,
        GameID: number
    }

    const [addChallengeInput, setAddChallengeInput] = useState("")
    const curKeyWord = useRef("")
    const [searchResult, setSearchResult] = useState<ChallengeSearchResult[]>([])
    const [rowSelection, setRowSelection] = useState({})
    const [loadingHover, setLoadingHover] = useState(false)
    const lastInputTime = useRef(0)

    const setInputState = (value: string) => {
        setAddChallengeInput(value)
        curKeyWord.current = value
        if (lastInputTime.current == 0) setLoadingHover(true)
        lastInputTime.current = dayjs().valueOf()
    }

    const columns: ColumnDef<ChallengeSearchResult>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "ChallengeID",
            header: "ChallengeID",
            cell: ({ row }) => (
                <div>{row.getValue("ChallengeID")}</div>
            ),
        },
        {
            accessorKey: "Name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        type="button"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Name
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <div>{row.getValue("Name")}</div>,
        },
        {
            accessorKey: "CreateTime",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        type="button"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        CreateTime
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <div>{row.getValue("CreateTime")}</div>,
        },
        {
            accessorKey: "Category",
            header: "Category",
            cell: ({ row }) => (
                <div>{row.getValue("Category")}</div>
            ),
        },
        {
            id: "Actions",
            header: "Actions",
            enableHiding: false,
            cell: ({ row }) => {

                const data = row.original

                return (
                    <Button
                        variant={"outline"}
                        size={"sm"}
                        type="button"
                        className="select-none"
                        onClick={() => handleAddChallenge(data)}
                    ><CirclePlus />添加</Button>
                )
            },
        },
    ]

    const handleAddChallenge = useCallback((data: ChallengeSearchResult) => {
        api.admin.addGameChallenge(data.GameID, data.ChallengeID).then((res) => {
            const challenge = res.data.data
            const category: string = challenge.category?.toLocaleLowerCase() as string
            const newSimpleChallenge: UserSimpleGameChallenge = {
                challenge_id: challenge.challenge_id ?? 0,
                challenge_name: challenge.challenge_name ?? "",
                category: challenge.category || ChallengeCategory.MISC,
                total_score: challenge.total_score ?? 0,
                cur_score: challenge.cur_score ?? 0,
                solve_count: challenge.solve_count || 0,
                visible: false,
            }
            // 插入题目列表
            setChallenges((prev) => ({
                ...prev,
                [category]: [...(prev[category] || []), newSimpleChallenge]
            }))
            // 插入题目解题状态列表
            setChallengeSolveStatusList((prev) => ({
                ...prev,
                [challenge.challenge_id || 0]: {
                    solved: false,
                    solve_count: 0,
                    cur_score: 0,
                }
            }))
            toast.success("题目添加成功")
        })
    }, [setChallenges])

    const table = useReactTable<ChallengeSearchResult>({
        data: searchResult,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        initialState: {
            pagination: {
                pageSize: 5,
            },
        },
        state: {
            rowSelection,
        },
    })

    const handleBatchAddChallenges = useCallback(async () => {
        const selectedRows = table.getFilteredSelectedRowModel().rows
        if (selectedRows.length === 0) {
            toast.error("请先选择要添加的题目")
            return
        }

        setLoadingHover(true)
        let successCount = 0
        let failCount = 0

        try {
            for (const row of selectedRows) {
                const data = row.original
                try {
                    const res = await api.admin.addGameChallenge(data.GameID, data.ChallengeID)
                    const challenge = res.data.data
                    const category: string = challenge.category?.toLocaleLowerCase() as string
                    const newSimpleChallenge: UserSimpleGameChallenge = {
                        challenge_id: challenge.challenge_id ?? 0,
                        challenge_name: challenge.challenge_name ?? "",
                        category: challenge.category || ChallengeCategory.MISC,
                        total_score: challenge.total_score ?? 0,
                        cur_score: challenge.cur_score ?? 0,
                        solve_count: challenge.solve_count || 0,
                        visible: false,
                    }
                    // 插入题目列表
                    setChallenges((prev) => ({
                        ...prev,
                        [category]: [...(prev[category] || []), newSimpleChallenge]
                    }))
                    // 插入题目解题状态列表
                    setChallengeSolveStatusList((prev) => ({
                        ...prev,
                        [challenge.challenge_id || 0]: {
                            solved: false,
                            solve_count: 0,
                            cur_score: 0,
                        }
                    }))
                    successCount++
                } catch (error) {
                    failCount++
                    const _ = error
                }
            }

            if (successCount > 0) {
                toast.success(`成功添加 ${successCount} 个题目${failCount > 0 ? `，失败 ${failCount} 个` : ''}`)
                // 清空选择
                setRowSelection({})
            } else {
                toast.error("批量添加失败")
            }
        } finally {
            setLoadingHover(false)
        }
    }, [table, setChallenges, setChallengeSolveStatusList, setRowSelection])

    const performSearch = useCallback((keyword: string) => {
        setLoadingHover(true)
        api.admin.searchChallenges({ keyword }).then((res) => {
            setSearchResult(res.data.data.map((c) => ({
                "Category": c.category,
                "ChallengeID": c.challenge_id || 0,
                "Name": c.name,
                "GameID": gameID,
                "CreateTime": c.create_time
            })))
            setLoadingHover(false)
        }).catch(() => {
            setLoadingHover(false)
        })
    }, [gameID])

    useEffect(() => {
        if (isOpen) {
            performSearch(curKeyWord.current)
        }
    }, [isOpen, performSearch])

    useEffect(() => {
        if (!isOpen) return
        
        const timeoutId = setTimeout(() => {
            if (lastInputTime.current > 0 && dayjs().valueOf() - lastInputTime.current >= 500) {
                performSearch(curKeyWord.current)
            }
        }, 500)

        return () => clearTimeout(timeoutId)
    }, [addChallengeInput, isOpen, performSearch])

    return (
        <Dialog open={isOpen} onOpenChange={(status) => {
            setIsOpen(status)
        }}>
            <DialogContent className="sm:max-w-[825px]" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader className="select-none">
                    <DialogTitle>搜索题目</DialogTitle>
                    <DialogDescription>
                        这会从题目库中搜索题目
                    </DialogDescription>
                </DialogHeader>
                <Input className="select-none" value={addChallengeInput} onChange={(e) => setInputState(e.target.value)} placeholder="在这里输入题目名字" />
                <div className="rounded-md border relative h-[300px] overflow-auto">
                    {loadingHover && (
                        <div className="absolute top-0 left-0 w-full h-full bg-background opacity-95 z-10 flex items-center justify-center">
                            <div className="flex">
                                <Loader2 className="animate-spin" />
                                <span className="font-bold ml-3">搜索中...</span>
                            </div>
                        </div>
                    )}
                    <Table>
                        <TableHeader className="select-none">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-end space-x-2 select-none">
                    <div className="flex-1 text-sm text-muted-foreground flex items-center">
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s) selected.
                    </div>
                    <div className="flex gap-3 items-center">
                        <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={handleBatchAddChallenges}
                            disabled={table.getFilteredSelectedRowModel().rows.length === 0 || loadingHover}
                        >
                            {loadingHover ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    添加中...
                                </>
                            ) : (
                                `批量添加 (${table.getFilteredSelectedRowModel().rows.length})`
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                        >
                            <ArrowLeft />
                        </Button>
                        <div className="text-sm text-muted-foreground">
                            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                        >
                            <ArrowRight />
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

AddChallengeFromLibraryDialog.whyDidYouRender = true