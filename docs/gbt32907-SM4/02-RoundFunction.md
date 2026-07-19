# GB/T 32907 SM4 — 轮函数 F (§6)

S-box、线性变换L、合成置换T


6 轮函数 F

6.
 1 轮函数结构

          X0 ,
      设输入为(  X1 ,
                X2 ,
                   X3)∈ (
                        Z32 ),
                           2 4
                                       2 ,
                               轮密钥为rk∈Z32
                                                   1):
                                          则轮函数 F 见式(
                   F(
                    X0 ,
                       X1 ,
                          X2 ,
                             X3 ,
                                rk)=X0 ⊕ T (
                                           X1 ⊕ X2 ⊕ X3 ⊕rk) ………………(1 )

 2 合成置换 T
6.

     T:
      Z32 →Z2 是一个可逆变换,
         2  32
                      由非线性变换τ 和线性变换L 复合而成,即 T (.
                                               )=L(
                                                  τ(.
                                                    ))。
     a) 非线性变换τ
     τ 由 4 个并行的 S 盒构成。
     设输入为 A = (a0 ,
                  a1 ,
                     a2 ,
                        a3)∈ (
                             Z82 ),输出为 B = (
                                 4
                                           b0 ,  b2 ,
                                              b1 ,  b3)∈ (
                                                         Z82 ),
                                                             4
                                                                  2):
                                                               则见式(
                (
                b0 ,
                   b1 ,
                      b2 ,
                         b3)=τ(
                              A )= (
                                   Sbox(
                                       a0),
                                          Sbox(
                                              a1),
                                                 Sbox(
                                                     a2),
                                                        Sbox(
                                                            a3)) …………(2 )
        Sbox 数据见表 1。
      式中,

                                      表 1 Sbox 数据

        0   1     2    3    4    5    6    7    8    9    A    B    C    D    E    F

 0     D6   90    E9   FE   CC   E1   3D   B7   16   B6   14   C2   28   FB   2C   05

 1     2B   67   9A    76   2A   BE   04   C3   AA   44   13   26   49   86   06   99

 2     9C   42    50   F4   91   EF   98   7A   33   54   0B   43   ED   CF   AC   62

 3     E4   B3    1C   A9   C9   08   E8   95   80   DF   94   FA   75   8F   3F   A6

 4     47   07    A7   FC   F3   73   17   BA   83   59   3C   19   E6   85   4F   A8

 5     68   6B    81   B2   71   64   DA   8B   F8   EB   0F   4B   70   56   9D   35

 6     1E   24    0E   5E   63   58   D1   A2   25   22   7C   3B   01   21   78   87

 7     D4   00    46   57   9F   D3   27   52   4C   36   02   E7   A0   C4   C8   9E

 8     EA   BF   8A    D2   40   C7   38   B5   A3   F7   F2   CE   F9   61   15   A1

 9     E0   AE    5D   A4   9B   34   1A   55   AD   93   32   30   F5   8C   B1   E3

  2
                                                                         GB/T 32907—2016


                                          表 1 (续)

       0    1     2    3    4    5    6     7    8    9    A    B    C     D    E    F

 A     1D   F6    E2   2E   82   66   CA    60   C0   29   23   AB   0D    53   4E   6F

 B     D5   DB    37   45   DE   FD   8E    2F   03   FF   6A   72   6D    6C   5B   51

 C     8D   1B    AF   92   BB   DD   BC    7F   11   D9   5C   41   1F    10   5A   D8

 D     0A   C1    31   88   A5   CD   7B    BD   2D   74   D0   12   B8    E5   B4   B0

 E     89   69    97   4A   0C   96   77    7E   65   B9   F1   09   C5    6E   C6   84

 F     18   F0    7D   EC   3A   DC   4D    20   79   EE   5F   3E   D7    CB   39   48


          EF’,则经 S 盒后的值为表中第 E 行和第 F 列的值,
     例如:输入‘                            Sbox(
                                           EF)=84。
     b) 线性变换 L
                                   2 ,
     非线性变换τ 的输出是线性变换L 的输入。设输入为 B ∈Z3          2 ,
                                      输出为 C ∈Z3     3):
                                    2          2
                                                 则见式(
        C =L(
            B )=B ⊕ (
                    B <<<2)⊕ (
                             B <<<10)⊕ (
                                       B <<<18)⊕ (
                                                 B <<<24)……(3 )


