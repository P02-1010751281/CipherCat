# ZUC序列密码 (GB/T 33133)

来源: GB/T 33133-2016

ICS35. 040 L
中华 人民 共和 国国 家标 准 GB/T 33133. 1—2016

信息安全技术祖冲之序列密码算法第 1 部分 :算法描述 Info rmations ecurityte chnology—ZUCstre amciphe ralgor ithm— Pat1: r   Al gorit  ehmdsc ript ion

2016 1013 发布                                     2017 0501 实施

中华人民共和国国家质量监督检验检疫总局               发布 中国 国家 标准 化管 理委 员会 GB/T 33133. 1—2016

目     次

前言 ………………………………………………………………………………………………………… Ⅲ 引言 ………………………………………………………………………………………………………… Ⅳ

1 范围 ……………………………………………………………………………………………………… 1 2 规范性引用文件 ………………………………………………………………………………………… 1 3 术语和定义 ……………………………………………………………………………………………… 1 4 符号和缩略语 …………………………………………………………………………………………… 2 1 运算符 ……………………………………………………………………………………………… 2 4. 2 符号 ………………………………………………………………………………………………… 2 4. 3 缩略语 ……………………………………………………………………………………………… 2 4. 5 算法流程 ………………………………………………………………………………………………… 2 1 算法结构 …………………………………………………………………………………………… 2 5. 2 线性反馈移位寄存器 LFSR ……………………………………………………………………… 3 5. 3 比特重组 BR ……………………………………………………………………………………… 4 5. 4 非线性函数 F ……………………………………………………………………………………… 4 5. 5 密钥装入 …………………………………………………………………………………………… 4 5. 6 算法运行 …………………………………………………………………………………………… 5 5. 附录 A (规范性附录) S 盒 ……………………………………………………………………………… 6 附录 B (资料性附录) 模 231 -1 乘法和模 231 -1 加法的实现 ………………………………………… 8 附录 C (资料性附录) 算法计算实例 …………………………………………………………………… 9 参考文献 ……………………………………………………………………………………………………
Ⅰ GB/T 33133. 1—2016

前   言

GB/T33133《信息安全技术    祖冲之序列密码算法》分为以下 3 部分: ———第 1 部分:算法描述; ———第 2 部分:保密性算法; ———第 3 部分:完整性算法。 本部分为 GB/T33133 的第 1 部分。 本部分按照 GB/T1. 1—2009 给出的规则起草。 本部分由国家密码管理局提出。 本部分由全国信息安全标准化技术委员会(SAC/TC260)归口。 本部分起草单位:北京信息科学技术研究院、中国科学院软件研 究所、中国 科学 院数 据与 通信 保护 研究教育中心、北京创原天地科技有限公司。 本部分主要起草人:冯登国、林东岱、冯秀涛、周春芳、刘辛越。

Ⅲ GB/T 33133. 1—2016

引       言

本部分的目标是保证祖冲之序列密码算法使用的正确性,为国内企业正 确研 发使 用祖 冲之 算法 的相关设备提供指导。 本部分修改采用如下国际标准:
ETSI/SAGE TS35.221.Spe cificat iono fthe3GPPConfi dentia lityandI nt regit y Al gor ithms128 EEA3 & 128EIA3. Document1:128-EEA3and128EIA3Speci fication.
ETS / I SAGE TS35.222.Spe cificat iono fthe3GPPConfi dentia lityandI nt regit y Al gor ithms128 EEA3 & 128EIA3.
Document2:ZUCSpe cific ation.
ETS / I SAGE TS35.223.Spe cifica tionofthe3GPPCon fi  tdenia lit yandI nt regit y Al gor ithms128 EEA3 & 128EIA3. Document3:Implement or’ sTestDa ta.
ETS / I SAGE TR35.924.Spec ificat ionoft he3GPPCon fi  tdenia lit yandI nt regit y Al gor ithms128 EEA3 & 128EIA3.
Do    t4: cumen Des ignandEva lua tionRepo rt. 本文件的发布机构请注意,声明符合本文件时,可能涉及《一种序列密码实现方法和装置》(专利号: 9)和《一种完整性认证方法》(专利号:
ZL200910086409.                               9)相关专利的使用。 ZL200910243440. 本文件的发布机构对于该专利的真实性、有效性和范围无任何立场。 该专利的持有人已向本文件的发布机构保证,他愿意同任何申请人 在合 理且 无歧 视的 条款 和条 件下,就该专利授权许可进行谈判。该专利的持有人已在本文件的发布 机构 备案。相关 信息 可以 通过 以下联系方式获得: 专利持有人姓名:中国科学院数据与通信保护研究教育中心、中国科学院软件研究所 100093、北京市中关村南四街 4 号邮编: 地址:北京市海淀区闵庄路甲 89 号邮编:                      100190 请注意除上述专利外,本文件的某些内容仍可能涉及专利。本文 件的 发布 机构 不承 担识 别这 些专 利的责任。

Ⅳ GB/T 33133. 1—2016

信息安全技术祖冲之序列密码算法第 1 部分:算法描述

1 范围

GB/T33133 的本部分给出了祖冲之序列密 码算 法的 一般 结构,基于 该结 构可 实现 本标 准其 他各 部分所规定的密码机制。 本部分适用于祖冲之序列密码算法相关产品的研制、检测和使用,可应用于涉及非国家秘密范畴的商业应用领域。

2 规范性引用文件

下列文件对于本文件的应用是必不可少的。凡是注日期的引用 文件,仅注 日期 的版 本适 用于 本文 件。凡是不注日期的引用文件,其最新版本(包括所有的修改单)适用于本文件。 GB/T25069—2010 信息安全技术术语

3 术语和定义

GB/T25069—2010 界定的以及下列术语和定义适用于本文件。 3. 1 祖冲之序列密码算法 ZUCS tream C ipher 祖冲之序列密码算法是中国自主研 制的 流密 码算 法,是运 用于 下一 代移 动通 信 4G 网络 中的 国际 标准密码算法,该算法包括祖冲之算法、保密性算法和完整性算法三个部分。 3. 2 位 bit 二进制数字 bina rydigi t 二进制计数制中使用的数字 0 或 1。 3. 3 字节 byte 一种由若干位组成的串,视作一个单位,通常代表一个字符或字符的一部分。 注 1:对一个给定的数据处理系统,一个字节中的位数是固定的。 注 2:一个字节通常是 8 位。

3. 4 字  wor d 由 2 个以上(包含 2 个)比特组成的比特串。 本部分主要使用 31 比特字和 32 比特字。 3. 5 字表示 wordr eprese ntation 本部分字默认采用十进制表示。当字采用其他进制表示时,总是 在字 的表 示之 前或 之后 添加 指示 符。例如,前缀 0x 指示该字采用十六进制表示,后缀下角标 2 指示该字采用二进制表示。 1 GB/T 33133. 1—2016

3. 6 高低位顺序 bito rdering 本部分规定字的最高位总是位于字表示中的最左边,最低位总是位于字表示中的最右边。

4 符号和缩略语

4. 1 运算符

下列运算符适用于本文件: +    算术加法运算 ab     整数 a 和b 的乘积 =      赋值操作符 mod    整数模运算 􀱇      按比特位逐位异或运算模 232 加法运算 ‖      字符串或字节串连接符 ·H     取字的最高 16 比特 ·L     取字的最低 16 比特 <<< k    32 比特字循环左移k 位 >> k     32 比特字右移k 位 a→b     向量a 赋值给向量b,即按分量逐分量赋值

4. 2 符号

下列符号适用于本文件: s0 , s1 , s2 ,…, s15 线性反馈移位寄存器的 16 个 31 比特寄存器单元变量 ,   , X0 X1 X2 X3,   比特重组输出的 4 个 32 比特字 R1 ,R2         非线性函数 F 的 2 个 32 比特记忆单元变量 W              非线性函数 F 输出的 32 比特字 W1             R1 与 X1 进行模 232 加法运算输出的 32 比特字 W2             R2 与 X2 按比特位逐位异或运算输出的 32 比特字 Z             算法每拍输出的 32 比特密钥字 k             初始种子密钥 iv             初始向量 di                       i=0, 15 比特的字符串常量,  1,2,…, 15 F             非线性函数 L             输出密钥字长度

4. 3 缩略语

下列缩略语适用于本文件:
LFSR   线性反馈移位寄存器(  LinearFeedba ckSh iftReg ister)
BR         B
比特重组(itReo rgan izat ion)

5 算法流程

5. 1 算法结构

LFSR)、比特重组( 祖冲之算法由线性反馈移位寄存器(         BR)和非线性函数 F 组成,见图 1。 2 GB/T 33133. 1—2016

图 1 祖冲之算法结构图

2 线性反馈移位寄存器 LFSR 5.

2. 5.1 概述

LFSR 包括 16 个 31 比特寄存器单元变量s0 , s1 ,…, s15 。 LFSR 的运行模式有 2 种:初始化模式和工作模式。

2. 5.2 初始化模式

LFSR 接收 1 个 31 比特字 u 的输入,对寄存器单元变量s0 , s1 ,…, s15 进行更新,计算过程如下: LFSRWi thI nitial istai      u) onMode( { ( 1)v=215s15 +217s13 +221s10 +220s4 + ( 1+28) s0 mod ( 231 -1); ( 2)s16 = ( v+u)mod ( 231 -1); ( 3)如果s16 =0,则置s16 =231 -1; ( 4)( s1 , s2 ,…, s15 , s16)→ ( s0 , s1 ,…, s14 , s15)。 } 模 231 -1 乘法和模 231 -1 加法的实现参见附录 B。

2. 5.3 工作模式

LFSR 无输入,直接对寄存器单元变量s0 , s1 ,…, s15 进行更新,计算过程如下: 3 GB/T 33133. 1—2016

LFSRWi t  rkMode() hWo { ( 1)s16 =215s15 +217s13 +221s10 +220s4 + ( 1+28) s0 mod ( 231 -1); ( 2)如果s16 =0,则置s16 =231 -1; ( 3)( s1 , s2 ,…, s15 , s16)→ ( s0 , s1 ,…, s14 , s15)。 }

3 比特重组 BR 5.

输入为 LFSR 寄存器单元变量s0 , s2 , s5 , s7 , s9 , s11 , s14 , s15 ,输出为 4 个 32 比特字 X0 、 X1 、 X2 、 X3 。 计算过程如下: B itRe cons truc tion() { ( 1)X0 =s15H ‖s14L ; ( 2)X1 =s11L ‖s9H ; ( 3)X2 =s7L ‖s5H ; ( 4)X3 =s2L ‖s0H 。 }

4 非线性函数 F 5.

F 包含 2 个 32 比特记忆单元变量 R1 和 R2 。 F 的输入为 3 个 32 比特字 X0 、 X1 、 X2 ,输出为一个 32 比特字 W 。计算过程如下:
F(X0 , X1 , X2) { ( 1)W = ( X0 􀱇 R1)       R2 ; ( 2)W 1 =R1   X1 ; ( 3)W 2 =R2 􀱇 X2 ; ( 4)R1 =S[L1( W 1L ‖W 2H )]; ( 5)R2 =S[ L2( W 2L ‖W 1H )]。 } S 盒定义见附录 A; 其中 S 为 32 比特的 S 盒变换,         L1 和 L2 为 32 比特线性变换,定义如下: L1( X )=X 􀱇 ( X <<< 2)􀱇 ( X <<< 10)􀱇 ( X <<< 18)􀱇 ( X <<< 24), L2( X )=X 􀱇 ( X <<< 8)􀱇 ( X <<< 14)􀱇 ( X <<< 22)􀱇 ( X <<< 30)。

5. 5 密钥装入

v 分别扩展为 16 个 31 比特字作为 LFSR 寄存器单元变量s0 , 将初始密钥k 和初始向量i                                    s1 ,…, s15 的初始状态。步骤如下: a) 设k 和i v 分别为 k0 ‖k1 ‖ …… ‖k15 和 i    v1 ‖ …… ‖i v0 ‖i        v15 其中ki 和ivi 均为 8 比特字节,  0≤i≤15 。 b) 对       ,            vi 。这里 di 为 16 比特的常量串,定义如下: 0≤i≤15 si =ki ‖di ‖i 有 4 GB/T 33133. 1—2016

d0 =1000100110101112 , d1 =0100110101111002 , d2 =1100010011010112 , d3 =0010011010111102 , d4 =1010111100010012 , d5 =0110101111000102 , d6 =1110001001101012 , d7 =0001001101011112 , d8 =1001101011110002 , d9 =0101111000100112 , d10 =1101011110001002 , d11 =0011010111100012 , d12 =1011110001001102 , d13 =0111100010011012 , d14 =1111000100110102 , d15 =1000111101011002 。

5. 6 算法运行

6. 5.1 概述

祖冲之算法的输入参数为初始密钥k、初始 向量i v 和正 整数 L ,输出 参数 为 L 个密 钥字 Z 。 算法 运行过程包含初始化步骤和工作步骤。

6. 5.2 初始化步骤

a) 按照 4.              v 装入 到 LFSR 的寄 存器 单元 变量s0 , 5 将初始密钥k 和初始向量i                              s1 ,…, s15 中,作为 LFSR 的初态; b) 令 32 比特记忆单元变量 R1 和 R2 为 0; c) 重复执行下述过程 32 次: 1) B itRe const ruct ion(); 2) W =F ( X0 , X1 , X2); 3) 输出 32 比特字 W ; 4) LFSRWi thI nitial istai          1)。 W >> onMode (

6. 5.3 工作步骤

a) 执行下述过程: 1) B itRe cons truc tion(); 2) F ( X0 , X1 , X2); 3) LFSRWithWorkMode()。 b) 重复计算 L 次下述过程: 1) B itRe cons truc tion(); 2) Z =F ( X0 , X1 , X2)􀱇 X3 ; 3) 输出 32 比特密钥字 Z ; 4) LFSRWi t  rkMode()。 hWo 算法计算实例参见附录 C。

5 GB/T 33133. 1—2016

附录 A (规范性附录) S    盒

32 比特 S 盒S 由 4 个小的 8×8 的 S 盒并置而成,即 S= ( S0 , S1 , S2 , S3 ),其中 S0 =S2 , S1 =S3 。 S0 和 S1 的定义分别见表 A.        2。设 S0(或 S1)的 8 比特输入为 x。将 x 视作两个 16 进制数的 1 和表 A. 连接,即 x=h‖l,则表 A. 1 (或表 A. 2)中第 h 行和第l 列交叉的元素即为S0 或 S1)的输出 S0 ( x)[或 S1( x)]。 设 S 盒S 的 32 比特输入 X 和 32 比特输出Y 分别为:
X =x0 ‖x1 ‖x2 ‖x3 Y =y0 ‖y1 ‖y2 ‖y3 其中,               i=0, xi 和yi 均为 8 比特字节,  1,2,3。则有 yi=Si(   xi), i=0, 1,2, 3。

1 S0 盒表 A.

0   1    2    3    4    5     6       7    8    9    A    B    C    D    E    F

0     3E   72   5B   47   CA   E0   00   33       04   D1   54   98   09   B9   6D   CB

1     7B   1B   F9   32   AF   9D   6A       A5   B8   2D   FC   1D   08   53   03
2     4D   4E   84   99   E4   CE   D9   91       DD   B6   85   48   8B   29   6E   AC

3     CD   C1   F8   1E   73   43   69       C6   B5   BD   FD   39   63   20   D4
4     76   7D   B2   A7   CF   ED   57       C5   F3   2C   BB   14   21   06   55   9B

5     E3   EF   5E   31   4F   7F   5A       A4   0D   82   51   49   5F   BA   58   1C

6     4A   16   D5   17   A8   92   24   1F       8C   FF   D8   AE   2E   01   D3   AD

7     3B   4B   DA   46   EB   C9   DE   9A       8F   87   D7   3A   80   6F   2F   C8

8     B1   B4   37   F7   0A   22   13   28       7C   CC   3C   89   C7   C3   96
9     07   BF   7E   F0   0B   2B   97   52       35   41   79   61   A6   4C   10   FE

A     BC   26   95   88   8A   B0   A3   FB       C0   18   94   F2   E1   E5   E9   5D

B     D0   DC   11   66   64   5C   EC   59       42   75   12   F5   74   9C   AA
C     0E   86   AB   BE   2A   02   E7   67       E6   44   A2   6C   C2   93   9F   F1

D     F6   FA   36   D2   50   68   9E   62       71   15   3D   D6   40   C4   E2   0F

E     8E   83   77   6B   25   05   3F   0C       30   EA   70   B7   A1   E8   A9
F     8D   27   1A   DB   81   B3   A0       F4   45   7A   19   DF   EE   78   34
6 GB/T 33133. 1—2016

2 S1 盒表 A.

0   1    2    3    4    5    6    7    8    9    A    B    C    D    E    F

0    55   C2   63   71   3B   C8   47   86   9F   3C   DA   5B   29   AA   FD
1    8C   C5   94   0C   A6   1A   13   00   E3   A8   16   72   40   F9   F8
2    44   26   68   96   81   D9   45   3E   10   76   C6   A7   8B   39   43   E1

3    3A   B5   56   2A   C0   6D   B3   05   22   66   BF   DC   0B   FA   62
4    DD   20   11   06   36   C9   C1   CF   F6   27   52   BB   69   F5   D4
5    7F   84   4C   D2   9C   57   A4   BC   4F   9A   DF   FE   D6   8D   7A   EB

6    2B   53   D8   5C   A1   14   17   FB   23   D5   7D   30   67   73   08
7    EE   B7   70   3F   61   B2   19   8E   4E   E5   4B   93   8F   5D   DB   A9

8    AD   F1   AE   2E   CB   0D   FC   F4   2D   46   6E   1D   97   E8   D1   E9

9    4D   37   A5   75   5E   83   9E   AB   82   9D   B9   1C   E0   CD   49
A    01   B6   BD   58   24   A2   5F   38   78   99   15   90   50   B8   95   E4

B    D0   91   C7   CE   ED   0F   B4   6F   A0   CC   F0   02   4A   79   C3   DE

C    A3   EF   EA   51   E6   6B   18   EC   1B   2C   80   F7   74   E7   FF
D    5A   6A   54   1E   41   31   92   35   C4   33   07   0A   BA   7E   0E
E    88   B1   98   7C   F3   3D   60   6C   7B   CA   D3   1F   32   65   04
F    64   BE   85   9B   2F   59   8A   D7   B0   25   AC   AF   12   03   E2   F2

注:S0 盒和 S1 盒数据均为十六进制表示。

7 GB/T 33133. 1—2016

附录 B (资料性附录) 模 231 -1 乘法和模 231 -1 加法的实现

B. 1 模 231 -1 乘法

两个 31 比特字模 231 -1 乘法可以快速实现。特别地,当其中一个字具有较低的汉明重量时,可以通过 31 比特的循环移位运算和模 231 -1 加法运算实现。例如,计算 abmod ( 231 -1),其中b=2i +2j +2k 。则 abmod( 231 -1)= ( a<<< 31i)+( a<<< 31j)+( a<<< 31k)mod ( 231 -1)   ……(B. 1) 式中:<<< 31 表示 31 比特左循环移位运算。

B. 2 模 231 -1 加法

在 32 位处理平台上,两个 31 比特字 a 和b 模 231 -1 加法运算c=a+bmod ( 231 -1)可以通过下面的两步计算实现: a) c=a+b; b) c= ( c & 0x7FFFFFFF)+ ( c>> 31)。

8 GB/T 33133. 1—2016

附录 C (资料性附录) 算法计算实例

1 测试向量 1(全 0) C.

输入: 密钥k:          00000000000000000000000000000000 v:00000000000000000000000000000000 初始向量i 输出: z1 : 27bede74 : z2 018082da 初始化: 线性反馈移位寄存器初态:

i      S0+i     S1+i       S2+i     S3+i      S4+i     S5+i       S6+i    S7+i

0    0044d700 0026bc 00 00626b00 00135e 00 00578900 0035e 200 00713500 0009a f00

8    004d7800 002 f1300 006bc 400      001a f100   005e 2600 003c 4d00 00789a 00 0047a c00

t       X0          X1     X2        X3        R1       R2         W      S15

0    008 f9a 00    f 100005e   a f00006b 6b000089 67822141    62a 3a55 f    008 f9a 00 4563cb1b

1     8a c7a c00   260000d7 780000e 2 5e         2e 00004d 474a 7e 119e 94bb         4 fe932a 0 28652a 0f

2    50c acb1b 4d000035 13000013 890000c 4 c 29687a 5 e 9b6eb51           291 f7a 20 7464 f744

3     e 8c92a 0f   9a 0000bc c 400009a e 2000026       29c f 2723   8c ac7 f5d    141698 fb 3 f5644ba

4     7e acf 744   a c000078   f 100005e   350000a f 2c 85a 655 24259cb0 e 41b0514 006a 144c

5    00d444ba cb1b00 f1 260000d7 a f00006b       cbfbc 5c0   44c 10b3a   50777 f9f 07038b9b

6    0e 07144c   2a 0f008 f 4d000035 780000e 083c 2 e  8d3         7ab f7679   0abddc c6 69b90e 2b

7    d3728b9b f 7448a c7     9a 0000bc 13000013       14 147e f 4   b669e 72d a eb0b9c 1 62a 913e a

8    c 5520e 2b 44ba 50c aa c000078         c 400009a 982834a 0 f 095d694 8796020c 7b591c c0

9    f 6b213e a    144c e8c 9    cb1b00 f1   f 100005e e 14727d6 d0225869     5 f2f fdde 70e 21147

初始化后线性反馈移位寄存器状态:

i      S0+i     S1+i       S2+i     S3+i      S4+i     S5+i       S6+i    S7+i

0    7c e15b8b   747c a0c 4 6259dd0b 47a 94c 2b        3a 89c 82e   32b433 fc   231e a13 f 31711e
8     4c cce 955   3 fb6071e 161d3512 7114b136 5154d452 78c 69a 74        4 f26ba 6b 3e 1b8d6a

有限状态机内部状态:
R1 =14c fd44c R2 =8c 6de 800 9 GB/T 33133. 1—2016

密钥流:

t      X0          X1      X2       X3        R1       R2        z       S15

0    7c 37ba 6b     b1367 f6c 1e 426568    dd0b f 2 9c   3512b f50 a 0920453    286da fe5 7 f08e
1    f e118d6a    d4522c 3a e 955463d    4c 2be 8f9   c 7ee 7f13   0c 0fa 817    27bede 74 3d383d04

2    7a 70e 141 9a 74e 229 071e 62e 2          c 82e c4b3   dde 63da 7 b9dd6a 41 018082da 13d6d780

2 测试向量 2(全 1) C.

输入: 密钥k:         fffff ffff ffff ffff ffff ffff ffff fff v:f 初始向量i ffff ffff ffff ffff ffff ffff ffff fff 输出: z1 : 0657c fa0 z2 : 7096398b 初始化: 线性反馈移位寄存器初态:

i     S0+i        S1+i     S2+i     S3+i     S4+i      S5+i     S6+i     S7+i

0    7 fc4d7 ff     7 fa6bc ff    7 fe26b ff   7 f935e ff   f 7d789 ff   7 fb5e 2ff    7 ff135 ff 7 f89a fff

8    7 fcd78 ff     7 faf 13f f     7 febc 4ff   7 f9a f1f f    7 fde 26f f    7 fbc 4df f     7 ff89a ff 7 fc7a cff

t      X0          X1      X2       X3        R1       R2        W       S15

0    f f8f 9af f      f 1ff ff5e    afff ff6b   6b fff f89   b51c      3629a 2110 30a        f f8f 9af f 76e 49a 1a

1    edc 9ac ff     26 fff fd7    78 fff fe2   5e fff f4d   a 75b6 f4b 1a 079628 8978 f089 5e 2d8983

2    bc 5b9a 1a     4d fff f35    13 fff f13   89 fff fc4   9810b315 99296735 35088b79 5b9484b8

3    b7298983   9a ffffbc    c 4ff ff9a   e 2ff ff26   4c 5bd8eb 2d577790 c 862a 1cb 2db5c
4    5b6b84b8   acff ff78    f 1ff ff5e   35 ffffaf   a 13dcb66 21d0939 f 4487d3e 3 60579232

5    c 0af c755     9a 1af ff1    26 fff fd7   faff ff6b   cc e 5c260   0c 50a 8e2    83629 fd2 29d4e
6    53a 99232    8983 ff8 f    4d fff f35   78 fff fe2   dada 0730 b516b128 a c461934 5e 02d9e
7    bc 05e 960 84b8edc 9       9a ffffbc   13 fff f13   2bbe 53a 4 12a 8a16e     1b f69 f78 7904dddc

8    f 209d9e 5     c 755bc 5b    acff ff78   4 cff ff9a   4a 90d661 d9c 744b4    e c602ba f 0c 3c9016

9    1879dddc 9232b729    9a 1af ff1   f 1ff ff5e   76bc 13d7 a 49e a404 2cb05071 0b9d257b

初始化后线性反馈移位寄存器状态:

i     S0+i        S1+i     S2+i     S3+i     S4+i      S5+i     S6+i     S7+i

0    09a 339ad 1291d190 25554227 36c 09187 0697773b      443c f9cd   6a 4cd899 49e 34bd0

8    56130b14   20e 8f24c   7a 5b1dc c 0c 3cc 2d1      c 1c082c 8   7 f5904a 2    55b61c e8 1 fe46106

10 GB/T 33133. 1—2016

有限状态机内部状态:
R1 =b8017bd5 R2 =9c e2de 5c 密钥流:

t       X0          X1       X2        X3        R1         R2         z      S15

0     3 fc81c e8     c 2d141d1 4bd08879 42271346 a a131b11 09d7706c 668b56d f 13 f56db f

1     27e a6106    82c 8f4b6 0b14d499 91872523 251e 7804        caac 5d66    0657c fa0 0c 0fe
2     181 f6db f 04a 21879       f 24c 93c 6     773b4a aa d94e 9228 91d88 fba 7096398b 10 f1e ecf

3 测试向量 3(随机) C.

输入: 密钥k:  3d4c4be96a82f daeb58f641db17b455b v:84319aa 初始向量i       8de6915ca1f6bda6bfbd8c766 输出: z1 : 14f1c 272 z2 : 3279c419 初始化: 线性反馈移位寄存器初态:

i      S0+i         S1+i    S2+i      S3+i      S4+i       S5+i       S6+i    S7+i 0     1e c4d784 2626bc 31 25e 26b9a 74935e a8 355789de 4135e 269              7e f13515 5709a fca 8     5a cd781 f     47a f136b   326bc 4da 0e 9af 16b      58de 26f b 3dbc 4dd8       22 f89a c7 2dc 7ac 66 t       X0          X1       X2        X3        R1         R2         W      S15 0     5b8 f9a c7     f 16b8 f5e    a fc826b a       6b9a 3d89   9c 62829 f 5d f00831       5b8 f9a c7 3c 7b93c 0 1     78 f7a c66     26 fb64d7   781 ffde 2     a 5e84c 4d    3d533 f3a    80 ff1 faf    4285372a 41901e e9 2     832093c 0 4dd81d35 136ba e13 89de 4bc 4          2c a57e 9d     d1db72 f9   3 f72c ca9 411e fa99 3     823d1e e9    9a c7b1bc c 4dab59a e 269e 926        0e 8dc 40f     60921a 4f 8073d36d 24b3 f49 f 4     4967 fa99    a c667b78   f 16b8 f5e    35156a af 16c 81467      da 8e7d8a a 87c 58e 5 74265785 5     e 84c f49 f      93c 045 f1    26 fb64d7   afca 826b    50c 9ea a4     3c 3b2d fd    d9135e 82 481c 5b9d 6     90385785   1e e95b8 f 4dd81d35     781 ffde 2    59857b80   be 0fbdc 1    f d2c eb1e 4b7 f87ed 7     96 ff5b9d    f a9978 f7    9a c7b1bc 136ba e13     9528 f8e a     bc c7f 7eb    8d89ddde 0e 633c e7 8     1c c687ed    f 49f 8320    a c667b78 c 4dab59a c 59d2932 e 1098a 64           46b676 f2 643a e5a 6 9     c 8753c e7 5785823d 93c 045 f1         f 16b8 f5e         e 755eba8    3 f9e 6e86    e ef1a 039 625a c5d7 初始化后线性反馈移位寄存器状态:

i      S0+i         S1+i    S2+i      S3+i      S4+i       S5+i       S6+i    S7+i

0     10da 5941    5b6a cbf 6    17060c e1 35368174    5c f4385a    479943d f 2753bab2 73775d6a

8     43930a 37 77b4a f31      15b2e 89f   24 ff6e 20    740c 40b9 026a 5503 194b2a 57 7a 9a1c ff

11 GB/T 33133. 1—2016

有限状态机内部状态:
R1 =860a 7df a R2 =b f0e 0ff c 密钥流:

t      X0         X1       X2        X3       R1        R2       z      S15

0    f 5342a 57    6e 20e f69    5d6a 8f32   0c e121b4 129d8b39 2d7cdc e1    3e ad461d 3d4a a9e
1     7a 951c ff 40b92b65 0a 374e a7 8174b6d5 ab7c f688         c 1598a a6   14 f1c 272 71db1828

2     e 3b6a 9e7   550349 fe   a f31e 6ee    385a 2e0c   3c ec1a 4a   9053c c0e 3279c 419 258937da

注:上述祖冲之算法计算实例中数据全部采用十六进制表示。

12 GB/T 33133. 1—2016

参   考   文   献

1] ETS [      I/SAGETS35. 221. Speci fiacti ono fthe3GPPConf identi ali tyandI nteg rit yAl gorithms 128EEA3 & 128-EIA3.
Documen  : t1 128EEA3and128EIA3Spec ificati on. 2] ETS [      I/SAGETS35. 222. Speci fiacti ono fthe3GPPConf identi ali tyandI nteg rit yAl gorithms 128EEA3 & 128-EIA3.
Document2:ZUCSpe cifi cation. 3] ETS [      I/SAGETS35. 223. Spec ificat iono ft he3GPPCon fiden tialit yandI nteg rit yAl gorithms 128EEA3 & 128-EIA3. Document3:Implementr’ o sTestDat a. 4] ETS [      I/SAGE TR35.924.Spe cificat ionofthe3GPPCon fiden tialit yandI nteg rit yAl gorithms 128EEA3 & 128EIA3.
Do    t4: cumen Dei sgnandEva lua tionRepo rt.
